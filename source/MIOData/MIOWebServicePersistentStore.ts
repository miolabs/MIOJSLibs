
/// <reference path="MIOPersistentStore.ts" />
/// <reference path="MIOFetchRequest.ts" />
/// <reference path="MIOWebServicePersistentStoreServerQueue.ts" />

enum MIOWebServicePersistentIgnoreEntityType {

    Query,
    Insert,
    Update,
    Delete
}

enum MIOWebServicePersistentStoreStatus {
    None,
    Downloading,
    Uploading,
    Ready
}

class MIOWebServicePersistentStore extends MIOPersistentStore {
    static get type(): string {
        return "MIOWebServicePersistentStoreType";
    }

    delegate = null;
    
    referenceIDKey = "identifier";
    set serverDeleteDateKey(value) {this.serverQueue.serverDeleteDateKey = value;}
    set serverReferenceIDKey(value) {this.serverQueue.serverReferenceIDKey = value;}
    
    private _identifierType = null;
    private _identifier = null;

    private entities = {};
    // Cache structures
    private objectsByReferenceID = {};
    private referenceIDByObjectID = {};
    //private objects = [];

    private serverQueue: MIOWebServicePersitentStoreServerQueue = null;
    private serverDateFormatter: MIOISO8601DateFormatter = null;

    didAddToPersistentStoreCoordinator(psc: MIOPersistentStoreCoordinator) {

        this.serverQueue = new MIOWebServicePersitentStoreServerQueue();
        this.serverQueue.initWithURL(this.url, psc.managedObjectModel);
        this.serverQueue.dataSource = this;
        this.serverQueue.delegate = this;

        //TODO: Open miorpc to get notification when some the server update his data from other instances
    }

    removePersistentStore(psc: MIOPersistentStoreCoordinator) {

        this.serverQueue = null;
        this.serverDateFormatter = null;

        //TODO: Close miorpc
    }

    executeRequest(persistentStoreRequest: MIOPersistentStoreRequest, context: MIOManagedObjectContext) {

        if (persistentStoreRequest.requestType == MIORequestType.Fetch) {
            let request = persistentStoreRequest as MIOFetchRequest;

            if (request.resultType == MIOFetchRequestResultType.MIOManagedObject) {
                return this.fetchObjects(request, context);
            }
        }
        else if (persistentStoreRequest.requestType == MIORequestType.Save) {
            let request = persistentStoreRequest as MIOSaveChangesRequest;
            return this.saveObjects(request, context);
        }
        return null;
    }

    // HACK: token must be removed and change for setMedata function instead
    set identifierType(value) {
        this._identifierType = value;
        this.serverQueue.identifierType = value;
    }

    set identifier(value) {
        this._identifier = value;
        this.serverQueue.identifier = value;
    }
    // END HACK

    set token(value) {
        this.serverQueue.token = value;
    }

    private createEntity(entityName: string) {

        let entity = {};
        entity["Name"] = entityName;
        entity["Objects"] = [];
        entity["Timestamp"] = 0;
        this.entities[entityName] = entity;

        return entity;
    }

    private entityInfoFromName(entityName: string) {

        var entity = this.entities[entityName];

        if (entity == null) {
            // Create empty entity
            entity = this.createEntity(entityName);
        }

        return entity;
    }

    objectByReferenceID(referenceID) {
        return this.objectsByReferenceID[referenceID];
    }

    newObjectWithReferenceID(referenceID:string, entityName:string, context:MIOManagedObjectContext) : MIOManagedObject{
    
        let mom = this.persistentStoreCoordinator.managedObjectModel;
        let entity = mom.entitiesByName[entityName];
        let mo:MIOManagedObject = MIOClassFromString(entityName);
        mo.init();
        mo.managedObjectContext = context;
        mo.entity = entity
        mo.setValueForKey(this.referenceIDKey, referenceID);
   
        return mo;
    }

    canServerSyncEntityNameForType(entityName: string, type: MIOWebServicePersistentIgnoreEntityType) {

        if (entityName == null || this.url == null) {
            throw ("MIOWebPersistentStore: Some of the properties are invalid");
        }

        let entityInfo = this.entityInfoFromName(entityName);

        if (entityInfo["status"] == MIOWebServicePersistentStoreStatus.Downloading
            || entityInfo["status"] == MIOWebServicePersistentStoreStatus.Uploading) {
            return false;
        }

        var result = true;
        switch (type) {

            case MIOWebServicePersistentIgnoreEntityType.Query:
                if (typeof this.delegate.canQueryOnServerForEntityName === "function") {
                    result = this.delegate.canQueryOnServerForEntityName(entityName);
                }
                break;

            case MIOWebServicePersistentIgnoreEntityType.Insert:
                if (typeof this.delegate.canInsertOnServerForEntityName === "function") {
                    result = this.delegate.canInsertOnServerForEntityName(entityName);
                }
                break;

            case MIOWebServicePersistentIgnoreEntityType.Update:
                if (typeof this.delegate.canUpdateOnServerForEntityName === "function") {
                    result = this.delegate.canUpdateOnServerForEntityName(entityName);
                }
                break;

            case MIOWebServicePersistentIgnoreEntityType.Delete:
                if (typeof this.delegate.canDeleteOnServerForEntityName === "function") {
                    result = this.delegate.canDeleteOnServerForEntityName(entityName);
                }
                break;

        }

        if (result == true && (this._identifier == null || this._identifierType == null)) {
            throw ("MIOWebPersistentStore: Some of the properties are invalid");
        }

        return result;
    }

    predicateFetchOnServerForEntityName(entityName, predicate) {

        var p = predicate;
        if (typeof this.delegate.predicateFetchOnServerForEntityName === "function") {
            p = this.delegate.predicateFetchOnServerForEntityName(entityName, predicate);
        }

        return p;
    }

    filterServerAttributeKey(ps: MIOWebServicePersistentStore, entityName, property, value, comparator) {

        var format = null;

        if (typeof this.delegate.filterServerAttributeKey === "function") {
            format = this.delegate.filterServerAttributeKey(this, entityName, property, value, comparator)
        }

        return format;
    }

    queryDidFinish(inserted, updated, deleted, context:MIOManagedObjectContext){

        var objsChanges = {};
        objsChanges[MIOInsertedObjectsKey] = inserted;
        objsChanges[MIOUpdatedObjectsKey] = updated;
        objsChanges[MIODeletedObjectsKey] = deleted;

        MIONotificationCenter.defaultCenter().postNotification(MIOManagedObjectContextDidSaveNotification, context, objsChanges);
    }

    serverQueuefetchObjectDidFail(code, referenceID, entityName) {

        var catchError = false;
        if (typeof this.delegate.serverErrorDownloadingObjectByReferenceID === "function") {
            catchError = this.delegate.serverErrorDownloadingObjectByReferenceID(this, referenceID, entityName);
        }
        // if (catchError == false) {
        //     throw ("MIOWebPersistentStore: Asking object to server that doesn't exist or has been deleted. (" + code + "-" + entityName + ":" + referenceID + ")");
        //}
        console.log("MIOWebPersistentStore: Asking object to server that doesn't exist or has been deleted. (" + code + "-" + entityName + ":" + referenceID + ")");
    }

    //
    // Query methods
    //
    private fetchObjects(request: MIOFetchRequest, context: MIOManagedObjectContext) {

        let entityInfo = this.entityInfoFromName(request.entityName);

        // TODO: Check with the server the last update fo the entity!        
        let entityName = entityInfo["Name"];
        this.serverQueue.fetchObjectsOnServer(entityName, request.predicate, context);

        // return the cache objects
        var objs = entityInfo["Objects"];
        objs = _MIOPredicateFilterObjects(objs, request.predicate);
        objs = _MIOSortDescriptorSortObjects(objs, request.sortDescriptors);

        return objs;
    }

    //
    // Save methods
    //
    private saveObjects(request: MIOSaveChangesRequest, context: MIOManagedObjectContext) {

        // Delete objects
        let insertedObjects = request.insertedObjects;
        let updatedObjects = request.updatedObjects;
        let deletedObjects = request.deletedObjects;

        for (var entityName in deletedObjects) {
            var del_objs = deletedObjects[entityName];
            let entity = this.entityInfoFromName(entityName);

            // Delete objects
            for (var i = 0; i < del_objs.length; i++) {
                var o: MIOManagedObject = del_objs[i];
                if (o.isFault == false) continue;
                this.deleteObjectInCache(o);
                //this.serverQueue.deleteObjectOnServer(o);
            }
        }

        // Inserted objects        
        for (var entityName in insertedObjects) {
            var ins_objs = insertedObjects[entityName];
            let entity = this.entityInfoFromName(entityName);

            // Add to context
            for (var i = 0; i < ins_objs.length; i++) {
                var o: MIOManagedObject = ins_objs[i];
                if (o.isFault == false) continue;
                this.insertObjectInCache(o);
                //this.serverQueue.insertObjectToServer(o);
            }
        }

        // Update objects
        for (var entityName in updatedObjects) {
            var upd_objs = updatedObjects[entityName];
            let entity = this.entityInfoFromName(entityName);

            // Update to context
            for (var i = 0; i < upd_objs.length; i++) {
                var o: MIOManagedObject = upd_objs[i];
                if (o.isFault == false) continue;

                this.updateObjectInCache(o);
                //this.serverQueue.updateObjectOnServer(o);
            }
        }
    }

    private updateObjectInCacheWithReferenceID(obj: MIOManagedObject, referenceID: string) {

        if (referenceID == null) return;

        let refID = referenceID.toUpperCase();
        this.objectsByReferenceID[refID] = obj;
        this.referenceIDByObjectID[obj.objectID] = refID;
    }

    private removeObjectInCacheWithReferenceID(referenceID: string) {

        let obj = this.objectsByReferenceID[referenceID];

        delete this.objectsByReferenceID[referenceID.toUpperCase()];
        delete this.referenceIDByObjectID[obj.objectID];
    }

    insertObjectInCache(obj: MIOManagedObject) {

        let entityName = obj.entity.managedObjectClassName;

        let entity = this.entityInfoFromName(entityName);
        var array = entity["Objects"];
        array.push(obj);

        let referenceID = obj.valueForKey(this.referenceIDKey);
        this.updateObjectInCacheWithReferenceID(obj, referenceID);
        obj.isFault = false;
    }

    updateObjectInCache(obj: MIOManagedObject) {

        obj.isFault = false;
    }

    deleteObjectInCache(obj: MIOManagedObject) {

        let entityName = obj.entity.managedObjectClassName;
        let entity = this.entityInfoFromName(entityName);
        var array = entity["Objects"];

        var index = array.indexOf(obj);
        if (index > -1) array.splice(index, 1);

        let referenceID = obj.valueForKey(this.referenceIDKey);
        this.removeObjectInCacheWithReferenceID(referenceID);
        obj.isFault = false;
    }

    //
    // Managed Objects -> Server objects
    //
    private serverDataFromObject(obj: MIOManagedObject) {

        let entityName = obj.entity.managedObjectClassName;
        let psc = this.persistentStoreCoordinator;
        let mom = psc.managedObjectModel;
        let ed: MIOEntityDescription = mom.entitiesByName[entityName];

        let item = {};

        let referenceID = obj.valueForKey(this.referenceIDKey);
        if (referenceID == null) throw ('MIOWebService: Object without referenceID');
        item[this.serverReferenceIDKey] = referenceID.toUpperCase();
        this.serverAttributes(ed.attributes, item, obj);
        this.serverRelationships(ed.relationships, item, obj);

        return item;
    }

    private serverAttributes(attributes, item, mo: MIOManagedObject) {

        for (var i = 0; i < attributes.length; i++) {
            let attr: MIOAttributeDescription = attributes[i];
            this.serverValueForAttribute(attr, attr.serverName, item, mo);
        }
    }

    private serverValueForAttribute(attribute: MIOAttributeDescription, servername, item, object) {

        if (attribute.name == this.referenceIDKey) return;

        let value = object.getValue(attribute.name);

        if (value == null && attribute.optional == false) {
            throw ("MIOWebPersistentStore: Couldn't set attribute value. Value is nil and it's not optional.");
        }

        if (value == null) return;

        let type = attribute.attributeType;
        if (type == MIOAttributeType.Date) {
            item[servername] = this.serverDateFormatter.stringFromDate(value);
        }
        else {
            item[servername] = value;
        }
    }

    private serverRelationships(relationships, item, mo: MIOManagedObject) {

        for (var i = 0; i < relationships.length; i++) {
            let rel: MIORelationshipDescription = relationships[i];

            if (rel.isToMany == false) {

                // spected object                                
                let obj: MIOManagedObject = mo.getValue(rel.name);
                if (obj == null) continue;

                let referenceID = obj.valueForKey(this.referenceIDKey);
                item[rel.serverName] = referenceID;
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
}