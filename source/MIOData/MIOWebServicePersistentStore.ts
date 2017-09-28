
/// <reference path="MIOPersistentStore.ts" />
/// <reference path="MIOFetchRequest.ts" />
/// <reference path="MIOWebService.ts" />

enum MIOWebServicePersistentStoreStatus{
    None,
    Downloading,
    Uploading,
    Ready
}

class MIOWebServicePersistentStore extends MIOPersistentStore
{ 
    static get type():string { 
        return "MIOWebServicePersistentStoreType";
    }
  
    // HACK: token must be removed and change for setMedata function instead
    type = null;
    identifier = null;
    ignoreEntities = [];
    ignoreFiltersEntities = [];
    
    serverDeleteDateName = "deletedAt";
    serverReferenceIDName="id";
    referenceIDName = "identifier";

    private entities = {};
    // Cache structures
    private objectsByReferenceID = {};
    private objects = [];

    private entityRelationshipNotifcations = [];

    private webservice:MIOWebService = null;
    private serverDateFormatter:MIOISO8601DateFormatter = null;

    didAddToPersistentStoreCoordinator(psc:MIOPersistentStoreCoordinator){
        
        this.webservice = new MIOWebService();
        this.webservice.init();

        this.serverDateFormatter = new MIOISO8601DateFormatter();
        this.serverDateFormatter.init();
        
        //TODO: Open miorpc to get notification when some the server update his data from other instances
    }

    removePersistentStore(psc:MIOPersistentStoreCoordinator){
        
        this.webservice = null;
        this.serverDateFormatter = null;

        //TODO: Close miorpc
    }

    set token(value){
        this.webservice.token = value;
    }

    executeRequest(persistentStoreRequest:MIOPersistentStoreRequest, context:MIOManagedObjectContext){
     
        if (persistentStoreRequest.requestType == MIORequestType.Fetch) {            
            let request = persistentStoreRequest as MIOFetchRequest;
            
            if (request.resultType == MIOFetchRequestResultType.MIOManagedObject) {
               return this.fetchObjects(request, context);
            }
        }
        else if (persistentStoreRequest.requestType == MIORequestType.Save){
            let request = persistentStoreRequest as MIOSaveChangesRequest;
            return this.saveObjects(request, context);
        }
        return null;
    }

    private createEntity(entityName:string){
     
        let entity = {};
        entity["Name"] = entityName;
        entity["Status"] = MIOWebServicePersistentStoreStatus.None;
        entity["Objects"] = [];
        entity["UploadingCount"] = 0;
        entity["Timestamp"] = 0;
        this.entities[entityName] = entity;

        return entity;
    }

    private entityInfoFromName(entityName:string) {

        var entity = this.entities[entityName];
        
        if (entity == null){
            // Create empty entity
            entity = this.createEntity(entityName);            
        }        

        return entity;
    }

    private fetchObjects(request:MIOFetchRequest, context:MIOManagedObjectContext){

        let entity = this.entityInfoFromName(request.entityName);

        // TODO: Check with the server the last update fo the entity!        
        this.downloadObjectsByEntity(entity, request.predicate, context);

        // return the cache objects
        var objs = entity["Objects"];
        objs = _MIOPredicateFilterObjects(objs, request.predicate);
        objs = _MIOSortDescriptorSortObjects(objs, request.sortDescriptors);
        
        return objs;
    }

    private canDownloadEntityByName(entityName:string) {

        let entity = this.entityInfoFromName(entityName);

        if (entity["status"] == MIOWebServicePersistentStoreStatus.Downloading
            || entity["status"] == MIOWebServicePersistentStoreStatus.Uploading) {
            return false;
        }        

        if (this.ignoreEntities.indexOf(entityName) != -1) {
            return false;
        }

        if (entityName == null || this.url == null || this.type == null || this.identifier == null) {
            throw ("MIOWebPersistentStore: Some of the properties are invalid");
        }

        return true;
    }

    private downloadObjectsByEntity(entity, predicate:MIOPredicate, context:MIOManagedObjectContext){

        let entityName = entity["Name"];

        if (this.canDownloadEntityByName(entityName) == false) return;

        entity["Status"] = MIOWebServicePersistentStoreStatus.Downloading;

        let url = this.url.urlByAppendingPathComponent("/" + this.type + "/" + this.identifier + "/" + entityName.toLocaleLowerCase());        
        var body = null;
        var httpMethod = "GET";

        if (predicate != null && this.ignoreFiltersEntities.indexOf(entityName) == -1) {

            let psc = this.persistentStoreCoordinator;
            let mom = psc.managedObjectModel;
            let ed:MIOEntityDescription = mom.entitiesByName[entityName];    
            let filters = this.parsePredictates(predicate.predicates, ed);
            
            body = {"where" : [filters]};
            let ts = entity["Timestamp"];
            if (ts > 0) {
                body["lastupdate"] = ts;
            }            
            httpMethod = "POST";
        }                

        this.webservice.sendRequest(url, body, httpMethod, this, function(code, json) {
                        
            entity["Status"] = MIOWebServicePersistentStoreStatus.Ready;
            
            if (code == 200){

                // Check entity timestamp
                // let ts1 = entity["Timestamp"] ? entity["Timestamp"] : 0;
                let ts2 = json["lastupdate"];
                // if (ts1 >= ts2) return;

                let items = json["data"];
                this.parseServerObjects(entity, items, context);
                entity["Timestamp"] = ts2;
                context.save();
            }                
        });    
    }

    parsePredictates(predicates, entity:MIOEntityDescription)  {
        
        var result = [];
        
        for (var count = 0; count < predicates.length; count++) {
            var o = predicates[count];

            if (o instanceof MIOPredicate) {
                //result = o.evaluateObject(object);
                //result = "P";
            }
            else if (o instanceof MIOPredicateItem) {
                //result = o.evaluateObject(object);
                let item = o as MIOPredicateItem;
                result.push(this.transformPredicateKey(item, entity));
                result.push(this.transfromPredicateOperator(item.comparator));
                result.push(this.transformPredicateValue(item.value));
            }
            else if (o instanceof MIOPredicateOperator) {
                // op = o.type;
                // lastResult = result;
                // result = null;
                //result = "OP";
            }

            // if (op != null && result != null) {
            //     if (op == MIOPredicateOperatorType.AND) {
            //         result = result && lastResult;
            //         op = null;
            //         if (result == false)
            //             break;
            //     }
            //     else if (op == MIOPredicateOperatorType.OR) {
            //         result = result || lastResult;
            //         op = null;
            //     }
            // }
        }

        return result;
    }

    private transformPredicateKey(item, entity:MIOEntityDescription){
        
        let serverKey = entity.serverAttributeName(item.key);
        return serverKey;
    }

    private transformPredicateValue(value) {

        if (value == null){
            return "null";
        }

        return value;
    }

    private transfromPredicateOperator(op):string {

        switch (op) {

            case MIOPredicateComparatorType.Equal:
                return "=";
        }

        return "";
    }

    private parseServerObjects(entity, items, context:MIOManagedObjectContext){

        let entityName = entity["Name"];
        let psc = this.persistentStoreCoordinator;
        let mom = psc.managedObjectModel;
        let ed:MIOEntityDescription = mom.entitiesByName[entityName];
        let objs = entity["Objects"];
    
        for(var i = 0; i < items.length; i++) {
            var item = items[i];
            let referenceID = item[this.serverReferenceIDName] ? item[this.serverReferenceIDName].toUpperCase() : null;
            let hasToDelete = item[this.serverDeleteDateName] != null ? true : false;
            //if (referenceID == null) throw ("MIOWebServicePersistentStore: Downloaded object without object ID");
            var mo:MIOManagedObject = this.objectsByReferenceID[referenceID];
            if (mo == null && hasToDelete == false) {                
                mo = MIOEntityDescription.insertNewObjectForEntityForName(entityName, context);
                this.parseAttributes(ed.attributes, item, mo);
                this.parseRelationships(ed.relationships, item, mo);
                //this.updateRelationshipsForObject(mo);       
                this.insertCacheObject(mo);
                mo.isFault = false;         
                MIONotificationCenter.defaultCenter().postNotification("MIOWebServicePersistentStoreEntityDownloaded", mo);
            }
            else if (mo != null && hasToDelete == true) {

                this.deleteCacheObject(mo);
                context.deleteObject(mo);
                mo.isFault = false;
            }
            else {

                let ts1 = mo.getValue("timestamp");
                let ts2 = item["updatedAt"];

                if (ts1 != ts2) {
                    this.parseAttributes(ed.attributes, item, mo);
                    this.parseRelationships(ed.relationships, item, mo);
                    //this.updateRelationshipsForObject(mo);
                    mo.isFault = false;
                    MIONotificationCenter.defaultCenter().postNotification("MIOWebServicePersistentStoreEntityDownloaded", mo);    
                }
            }                        
        }
    }

    private parseAttributes(attributes, item, mo:MIOManagedObject) {
        
        for (var i = 0; i < attributes.length; i++){
            let attr:MIOAttributeDescription = attributes[i];
            this.parseValueForAttribute(attr, item[attr.serverName], mo);
        }
    }
    
    private parseValueForAttribute(attribute:MIOAttributeDescription, value, object){
        
        if (value == null && attribute.optional == false) {
            throw ("MIOWebPersistentStore: Couldn't set attribute value. Value is nil and it's not optional.");
        }
        
        if (value == null) return;
        let type = attribute.attributeType;
        
        if (type == MIOAttributeType.Boolean) {
            if (typeof(value) === "boolean") {
                object.setValue(attribute.name, value);
            }
            else if (typeof(value) === "string") {
                let lwValue = value.toLocaleLowerCase();
                if (lwValue == "yes" || lwValue == "true" || lwValue == "1") 
                    object.setValue(attribute.name, true);
                else 
                    object.setValue(attribute.name, false);
            }
            else {
                let v = value > 0 ? true : false;
                object.setValue(attribute.name, v);
            }
        }
        else if (type == MIOAttributeType.Integer) {
            object.setValue(attribute.name, parseInt(value));
        }
        else if (type == MIOAttributeType.Float || type == MIOAttributeType.Number) {
            object.setValue(attribute.name, parseFloat(value));
        }
        else if (type == MIOAttributeType.String) {
            object.setValue(attribute.name, value);
        }
        else if (type == MIOAttributeType.Date){
            object.setValue(attribute.name, this.serverDateFormatter.dateFromString(value));
        }
    }

    private parseRelationships(relationships, item, mo:MIOManagedObject){
        
        for (var i = 0; i < relationships.length; i++){
            let rel:MIORelationshipDescription = relationships[i];

            if (rel.isToMany == false) {

                // spected object
                let referenceID:string = item[rel.serverName];
                if (referenceID == null) continue;
    
                let obj = this.fetchObjectByReferenceID(referenceID, rel.destinationEntityName, mo.managedObjectContext);
                if (obj == null) {
                    
                    obj = MIOEntityDescription.insertNewObjectForEntityForName(rel.destinationEntityName, mo.managedObjectContext);
                    this.insertCacheObject(obj);
                    obj.isFault = false;
                    // var objsNotes = this.entityRelationshipNotifcations[referenceID];
                    // if (objsNotes == null) {
                    //     objsNotes = [];
                    //     this.entityRelationshipNotifcations[referenceID] = objsNotes;
                    // }
    
                    // objsNotes.push({"MO": mo, "PN": rel.name, "TM": rel.isToMany});
                    
                }
                mo.setValue(rel.name, obj);                
            }
            else {

                let ids = item[rel.serverName];
                if (ids == null) continue;
                
                for (var j = 0; j < ids.length; j++) {

                    let referenceID:string = ids[j];
                    if (referenceID == null) continue;

                    let obj = this.fetchObjectByReferenceID(referenceID, rel.destinationEntityName, mo.managedObjectContext);
                    if (obj == null) {
                
                        obj = MIOEntityDescription.insertNewObjectForEntityForName(rel.destinationEntityName, mo.managedObjectContext);
                        this.insertCacheObject(obj);
                        obj.isFault = false;
                            
                        // var objsNotes = this.entityRelationshipNotifcations[objID];
                        // if (objsNotes == null) {
                        //     objsNotes = [];
                        //     this.entityRelationshipNotifcations[objID] = objsNotes;
                        // }

                        // objsNotes.push({"MO": mo, "PN": rel.name, "TM": rel.isToMany});
                    }
                    mo.addObject(rel.name, obj);
                }
            }
        }
    }
    
    private fetchObjectByReferenceID(identifier:string, entityName:string, context:MIOManagedObjectContext) {
        
        // let request = new MIOFetchRequest();
        // request.initWithEntityName(entityName);
        // request.predicate = MIOPredicate.predicateWithFormat("identifier == " + identifier);
        
        let obj = this.objectsByReferenceID[identifier];
        if (obj == null) {
            this.downloadObjectByReferenceID(entityName, identifier, context);
        }
        return obj;
    }        

    private downloadObjectByReferenceID(entityName, referenceID, context){

        if (this.canDownloadEntityByName(entityName) == false) return;                

        let entity = this.entityInfoFromName(entityName);
        entity["Status"] = MIOWebServicePersistentStoreStatus.Downloading;
        
        let url = this.url.urlByAppendingPathComponent("/" + this.type + "/" + this.identifier + "/" + entityName.toLocaleLowerCase() + "/" + referenceID.toUpperCase());        
        var body = null;
        var httpMethod = "GET";

        this.webservice.sendRequest(url, body, httpMethod, this, function(code, json) {
                    
            entity["Status"] = MIOWebServicePersistentStoreStatus.Ready;
        
            if (code == 200){

                // Check entity timestamp
                // let ts1 = entity["Timestamp"] ? entity["Timestamp"] : 0;
                let ts2 = json["lastupdate"];
                // if (ts1 >= ts2) return;

                let item = json["data"];
                this.parseServerObjects(entity, [item], context);
                entity["Timestamp"] = ts2;
                context.save();
            }                
        });  
    }

    private updateRelationshipsForObject(obj:MIOManagedObject){

        let objID = obj.getValue("identifier");
        if (objID == null) return;
        
        let objsNotes = this.entityRelationshipNotifcations[objID];
        if (objsNotes == null) return;

        for (var index = 0; index < objsNotes.length; index++) {
            let item = objsNotes[index];
            let parent:MIOManagedObject = item["MO"];
            let propertyName:string = item["PN"];
            let toMany:boolean = item["TM"];
            
            if (toMany){
                parent.addObject(propertyName, obj);
            }
            else {
                parent.setValue(propertyName, obj);
            }            
        }

        delete this.entityRelationshipNotifcations[objID];
    }

    private saveObjects(request:MIOSaveChangesRequest, context:MIOManagedObjectContext){
        
        // Remove objects
        let insertedObjects = request.insertedObjects;
        let updateObjects = request.updatedObjects;
        let deletedObjects = request.deletedObjects;        

        for (var entityName in deletedObjects)
        {
            var del_objs = deletedObjects[entityName];
            let entity = this.entityInfoFromName(entityName);

            // Delete objects
            var array = entity["Objects"];
            for (var i = 0; i < del_objs.length; i++)
            {
                var o:MIOManagedObject = del_objs[i];
                
                this.deleteCacheObject(o);
                this.deleteObjectOnServer(o);                
            }  
        }

        // Inserted objects        
        for (var entityName in insertedObjects)
        {
            var ins_objs = insertedObjects[entityName];
            let entity = this.entityInfoFromName(entityName);
            
            // Add to context
            var array = entity["Objects"];
            for (var i = 0; i < ins_objs.length; i++)
            {
                var o:MIOManagedObject = ins_objs[i];
                if (o.isFault == false) continue;

                // TODO: Insert data to server
                this.insertObjectToServer(o);                            
                array.push(o);
                this.objects.push(o);
                let referenceID = o.getValue(this.referenceIDName);
                if (referenceID != null) {
                    this.objectsByReferenceID[referenceID] = o;
                }
            }            
        }
/*
        // Update objects
        for (var key in this._updateObjects)
        {
            var upd_objs = this._updateObjects[key];

            // save changes
            for (var i = 0; i < upd_objs.length; i++)
            {
                var o = upd_objs[i];
                o.saveChanges();
            }
        }
*/
    }

    private insertCacheObject(obj:MIOManagedObject){
     
        let entityName = obj.entity.managedObjectClassName;

        let entity = this.entityInfoFromName(entityName);        
        var array = entity["Objects"];
        
        // Update entity objects
        array.push(obj);
        // update objects array
        this.objects.push(obj);  
        
        let referenceID = obj.getValue(this.referenceIDName);
        if (referenceID != null){
            this.objectsByReferenceID[referenceID] = obj;                 
        }        
    }

                
    private insertObjectToServer(obj:MIOManagedObject) {
     
        let entityName = obj.entity.managedObjectClassName;
        if (this.canDownloadEntityByName(entityName) == false) return;
        
        let entity = this.entityInfoFromName(entityName);
        
        entity["Status"] = MIOWebServicePersistentStoreStatus.Uploading;
        var count = entity["UploadingCount"];
        count++;
        entity["UploadingCount"] = count;

        let url = this.url.urlByAppendingPathComponent("/" + this.type + "/" + this.identifier + "/" + entityName.toLocaleLowerCase());
        let body = this.serverDataFromObject(obj);
        let httpMethod = "PUT";

        this.webservice.sendRequest(url, body, httpMethod, this, function(code, json) {
                        
            var count = entity["UploadingCount"];
            count--;
            if (count == 0) {
                entity["UploadingCount"] = count;
                entity["Status"] = MIOWebServicePersistentStoreStatus.Ready;
            }
            
            if (code == 200){
                // this.parseServerObjects(entity, json, context);
                // entity["Status"] = MIOWebServicePersistentStoreStatus.Ready;
                // context.save();
            }                
        });    
    }            

    private serverDataFromObject(obj:MIOManagedObject) {
                
        let entityName = obj.entity.managedObjectClassName;
        let psc = this.persistentStoreCoordinator;
        let mom = psc.managedObjectModel;
        let ed:MIOEntityDescription = mom.entitiesByName[entityName];

        let item  = {};
        //item[this.objectIDServername] = obj.objectID.toUpperCase();
        this.serverAttributes(ed.attributes, item, obj);
        this.serverRelationships(ed.relationships, item, obj);

        return item;
    }

    private serverAttributes(attributes, item, mo:MIOManagedObject) {
        
        for (var i = 0; i < attributes.length; i++){
            let attr:MIOAttributeDescription = attributes[i];
            this.serverValueForAttribute(attr, attr.serverName, item, mo);
        }
    }

    private serverValueForAttribute(attribute:MIOAttributeDescription, servername, item, object){

        let value = object.getValue(attribute.name);
        
        if (value == null && attribute.optional == false) {
            throw ("MIOWebPersistentStore: Couldn't set attribute value. Value is nil and it's not optional.");
        }
        
        if (value == null) return;

        if (attribute.name == this.referenceIDName) {
            value = value.toUpperCase();
        }

        let type = attribute.attributeType;
        if (type == MIOAttributeType.Date){
            item[servername] = this.serverDateFormatter.stringFromDate(value);
        } 
        else {
            item[servername] = value;
        }
    }

    private serverRelationships(relationships, item, mo:MIOManagedObject){
        
        for (var i = 0; i < relationships.length; i++){
            let rel:MIORelationshipDescription = relationships[i];

            if (rel.isToMany == false) {

                // spected object                                
                let obj:MIOManagedObject = mo.getValue(rel.name);
                if (obj == null) continue;

                item[rel.serverName] = obj.objectID;
            }
            else {

/*                let ids = item[rel.serverName];
                if (ids == null) continue;
                
                for (var j = 0; j < ids.length; j++) {

                    let objID:string = ids[j];
                    if (objID == null) continue;

                    let obj = this.fetchObjectByID(objID, rel.destinationEntityName, mo.managedObjectContext);
                    if (obj == null) {
                
                        var objsNotes = this.entityRelationshipNotifcations[objID];
                        if (objsNotes == null) {
                            objsNotes = [];
                            this.entityRelationshipNotifcations[objID] = objsNotes;
                        }

                        objsNotes.push({"MO": mo, "PN": rel.name, "TM": rel.isToMany});
                    }
                    else {
                        mo.addObject(rel.name, obj);
                    }
                }*/
            }
        }
    }

    private deleteCacheObject(obj:MIOManagedObject) {

        let entityName = obj.entity.managedObjectClassName;
        let entity = this.entityInfoFromName(entityName);
        var array = entity["Objects"];

        var index = array.indexOf(obj);
        if (index > -1) array.splice(index, 1);
        
        index = this.objects.indexOf(obj);
        if (index > -1) this.objects.splice(index, 1);
        
        let referenceID = obj.getValue(this.referenceIDName);
        if (referenceID != null) {
            delete(this.objectsByReferenceID[referenceID.toUpperCase()]);
        }
    }

    private deleteObjectOnServer(obj:MIOManagedObject){

        let entityName = obj.entity.managedObjectClassName;
        
        if (this.canDownloadEntityByName(entityName) == false) return;
        
        let entity = this.entityInfoFromName(entityName);
        
        entity["Status"] = MIOWebServicePersistentStoreStatus.Uploading;
        var count = entity["UploadingCount"];
        count++;
        entity["UploadingCount"] = count;

        let referenceID = obj.getValue(this.referenceIDName);
        let url = this.url.urlByAppendingPathComponent("/" + this.type + "/" + this.identifier + "/" + entityName.toLocaleLowerCase() + "/" + referenceID.toUpperCase());
        let httpMethod = "DELETE";

        this.webservice.sendRequest(url, null, httpMethod, this, function(code, json) {
                        
            var count = entity["UploadingCount"];
            count--;
            if (count == 0) {
                entity["UploadingCount"] = count;
                entity["Status"] = MIOWebServicePersistentStoreStatus.Ready;
            }
            
            if (code == 200){
                // this.parseServerObjects(entity, json, context);
                // entity["Status"] = MIOWebServicePersistentStoreStatus.Ready;
                // context.save();
            }                                    
        });    
    }
}