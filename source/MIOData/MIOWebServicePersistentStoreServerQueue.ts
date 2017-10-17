
/// <reference path="../MIOFoundation/MIOFoundation.ts" />

class MIOWebServicePersitentStoreServerQueue extends MIOObject {

    token = null;
    identifier = null;
    identifierType = null;

    dataSource = null;
    delegate = null;

    get referenceIDKey(){return this.delegate.referenceIDKey;}
    serverDeleteDateKey = "deletedAt";    
    serverReferenceIDKey = "id";    

    private url: MIOURL = null;
    private mom: MIOManagedObjectModel = null;

    private serverDateFormatter: MIOISO8601DateFormatter = null;

    private queries = {};

    initWithURL(url: MIOURL, mom: MIOManagedObjectModel) {
        super.init();
        this.url = url;
        this.mom = mom;

        this.serverDateFormatter = new MIOISO8601DateFormatter();
        this.serverDateFormatter.init();
    }

    private checkQueryByID(queryID: string, context: MIOManagedObjectContext) {

        let query = this.queries[queryID];
        if (query == null) return;

        let count = query["Count"];
        if (count == 0) {
            // Notify the cahnges changes
            let inserted = query["Inserted"] ? query["Inserted"] : [];
            let updated = query["Updated"] ? query["Updated"] : [];
            let deleted = query["Deleted"] ? query["Deleted"] : [];
            this.delegate.queryDidFinish(inserted, updated, deleted, context);
            delete this.queries[queryID];
        }
    }

    objectWithReferenceID(referenceID, queryID:string) {

        // let query = this.queries[queryID];
        // var objs = query["Objects"];

        // var obj = objs[referenceID];
        // if (obj != null) return obj;

        let obj = this.delegate.objectByReferenceID(referenceID);
        return obj;
    }

    addInsertedObjectInQuery(queryID: string, obj: MIOManagedObject) {

        let query = this.queries[queryID];

        let entityName = obj.entity.managedObjectClassName;
        var entities = query["Inserted"];

        let ins_objs = entities[entityName];
        if (ins_objs == null) {
            ins_objs = [];
            entities[entityName] = ins_objs;
        }
        
        ins_objs.push(obj);
        this.delegate.insertObjectInCache(obj);
    }

    addUpdatedObjectInQuery(queryID: string, obj: MIOManagedObject) {

        let query = this.queries[queryID];
        
        let entityName = obj.entity.managedObjectClassName;

        // Check if the object is already in the inserted cache
        var entities = query["Inserted"];
        var ins_obj = entities[entityName];
        if (ins_obj != null) {
            let index = ins_obj.indexOf(obj);
            if (index > -1) return;
        }

        entities = query["Updated"];
        var upd_objs = entities[entityName];    
        if (upd_objs == null) {
            upd_objs = [];
            entities[entityName] = upd_objs;
        }

        let index = upd_objs.indexOf(obj)
        if (index == -1) {
            // Add to update objects
            upd_objs.push(obj);
            this.delegate.updateObjectInCache(obj);
        }
    }

    addDeletedObjectInQuery(queryID: string, obj: MIOManagedObject) {

        // TODO:
        let query = this.queries[queryID];
        var del_objs = query["Deleted"];

        if (del_objs == null) {
            del_objs = [];
            query["Updated"] = del_objs;
        }

        let index = del_objs.indexOf(obj)
        if (index == -1) {
            del_objs.push(obj);
            this.delegate.deleteObjectInCache(obj);
        }        
    }

    private sendRequest(url: MIOURL, body, httpMethod: string, target?, completion?) {

        let request = MIOURLRequest.requestWithURL(url);

        // Setup headers
        if (this.token != null)
            request.setHeaderField("Authorization", "Bearer " + this.token);
        request.setHeaderField("Content-Type", "application/json");

        if (body != null)
            request.body = JSON.stringify(body);
        request.httpMethod = httpMethod;

        var urlConnection = new MIOURLConnection();
        urlConnection.initWithRequestBlock(request, this, function (statusCode, data) {

            var json = null;
            var error = null;
            if (statusCode == 200) {
                if (data != null)
                    json = JSON.parse(data.replace(/(\r\n|\n|\r)/gm, ""));
            }
            else if (statusCode == 401) {
                error = { "Code": statusCode, "Error": "Invalid token. The user need to login again" };
                MIONotificationCenter.defaultCenter().postNotification("MIOWebServiceError", error);
            }
            else if (statusCode == 422) {
                error = { "Code": statusCode, "Error": "Unprocessable Entity. Check the value of the parameters you send it" };
                MIONotificationCenter.defaultCenter().postNotification("MIOWebServiceError", error);
            }
            else {
                error = { "Code": statusCode, "Error": "Conection error. Check internet and server status" };
                MIONotificationCenter.defaultCenter().postNotification("MIOWebServiceError", error);
            }

            if (error != null) {
                console.log("MIOWebserice: " + request.httpMethod + ": " + request.url.absoluteString);
                console.log("MIOWebserice: Error " + error["Code"] + ". " + error["Error"]);
            }

            completion.call(target, statusCode, json);
        });
    }

    private fetchOnSever(url: MIOURL, body, httpMethod: string, referenceID: string, entityName: string, queryID: string, context: MIOManagedObjectContext) {

        // Create query to keep track the objects
        var qID = queryID;
        var query = null;
        if (qID == null) {
            qID = MIOUUID.uuid();
            query = {};
            query["Count"] = 1;
            query["Inserted"] = {}
            query["Updated"] = {}
            query["Deleted"] = {}
            query["Objects"] = {}
            this.queries[qID] = query;
        }
        else {
            query = this.queries[queryID];
            query["Count"] = query["Count"] + 1;
        }

        // NO, so we can start ask to the server
        this.sendRequest(url, body, httpMethod, this, function (code, json) {

            if (code == 200) {
                // Check entity timestamp
                // let ts1 = entity["Timestamp"] ? entity["Timestamp"] : 0;
                let ts2 = json["lastupdate"];
                // if (ts1 >= ts2) return;

                // Convert to an array in case of fetch by reference ID
                let items = referenceID ? [json["data"]] : json["data"];
                this.parseServerObjectsForEntity(entityName, items, qID, context);
            }
            else {
                // The object is deleted
                if (typeof this.delegate.serverQueuefetchObjectDidFail === "function") {
                    this.delegate.serverQueuefetchObjectDidFail(code, referenceID, entityName);
                }
            }

            let query = this.queries[qID];
            query["Count"] = query["Count"] - 1;
            this.checkQueryByID(qID, context);
        });
    }

    fetchObjectsOnServer(entityName: string, predicate: MIOPredicate, context: MIOManagedObjectContext) {

        var result = this.delegate.canServerSyncEntityNameForType(entityName, MIOWebServicePersistentIgnoreEntityType.Query);
        if (result == false) return;

        var p: MIOPredicate = this.delegate.predicateFetchOnServerForEntityName(entityName, predicate);

        let url = this.url.urlByAppendingPathComponent("/" + this.identifierType + "/" + this.identifier + "/" + entityName.toLocaleLowerCase());
        var body = null;
        var httpMethod = "GET";

        if (p != null) {
            let ed: MIOEntityDescription = this.mom.entitiesByName[entityName];
            let filters = this.parsePredictates(p.predicateGroup.predicates, ed);

            body = { "where": filters };
            httpMethod = "POST";
        }

        this.fetchOnSever(url, body, httpMethod, null, entityName, null, context);
    }

    fetchObjectOnServerByReferenceID(referenceID: string, entityName: string, queryID: string, context: MIOManagedObjectContext) {

        var result = this.delegate.canServerSyncEntityNameForType(entityName, MIOWebServicePersistentIgnoreEntityType.Query);
        if (result == false) return;

        let url = this.url.urlByAppendingPathComponent("/" + this.identifierType + "/" + this.identifier + "/" + entityName.toLocaleLowerCase() + "/" + referenceID.toUpperCase());
        var body = null;
        var httpMethod = "GET";

        this.fetchOnSever(url, body, httpMethod, referenceID, entityName, queryID, context);
    }

    private fetchObjectByReferenceID(referenceID: string, entityName: string, queryID: string, context: MIOManagedObjectContext) {

        var obj = this.objectWithReferenceID(referenceID, queryID);
        if (obj != null) return obj;

        if (obj == null) {
            obj = this.delegate.newObjectWithReferenceID(referenceID, entityName, context);
            
            this.addInsertedObjectInQuery(queryID, obj);

            // let query = this.queries[queryID];
            // let objs = query["Objects"];
            // objs[referenceID] = obj;

            this.fetchObjectOnServerByReferenceID(referenceID, entityName, queryID, context);
        }

        return obj;
    }


    private parsePredictates(predicates, entity: MIOEntityDescription) {

        var result = [];

        for (var count = 0; count < predicates.length; count++) {
            var o = predicates[count];

            if (o instanceof MIOPredicateGroup) {
                let group = o as MIOPredicateGroup;
                let i = {};
                i["type"] = "group";
                i["values"] = this.parsePredictates(group.predicates, entity);
                result.push(i);
            }
            else if (o instanceof MIOPredicateItem) {
                //result = o.evaluateObject(object);
                let item = o as MIOPredicateItem;
                let mapItemPredicateFormat = this.delegate.filterServerAttributeKey(entity.managedObjectClassName, item.key, item.value, item.comparator);
                if (mapItemPredicateFormat == null) {
                    let i = {};
                    i["type"] = "item";
                    this.transformPredicateItem(i, item, entity);
                    result.push(i);
                } else {
                    let p = MIOPredicate.predicateWithFormat(mapItemPredicateFormat);
                    let group: MIOPredicateGroup = p.predicateGroup;
                    let i = {};
                    i["type"] = "group";
                    i["values"] = this.parsePredictates(group.predicates, entity);
                    result.push(i);
                }
            }
            else if (o instanceof MIOPredicateOperator) {
                let op = o as MIOPredicateOperator;
                let i = {};
                i["type"] = "operator";
                i["value"] = this.transfromPredicateOperator(op.type);
                result.push(i)
            }
        }

        return result;
    }

    private transformPredicateItem(i, item, entity) {

        let value = item.value;
        let cmp = item.comparator;

        i["key"] = this.transformPredicateKey(item, entity);

        if (cmp.Equal && value == null) {
            i["comparator"] = "is null";
        }
        else if (cmp.Distinct && value == null) {
            i["comparator"] = "not null";
        }
        else {
            i["comparator"] = this.transfromPredicateComparator(item.comparator);
            i["value"] = item.value;
        }
    }

    private transformPredicateKey(item, entity: MIOEntityDescription) {

        var serverKey = null
        // Check server relationship        
        let keys = item.key.split('.');

        if (keys > 2) {
            throw ("MIOWebServicePersistentStore: It's not supported a key path with more than 2 keys.");
        }

        if (keys.length == 1) {
            serverKey = entity.serverAttributeName(item.key);
        }
        else if (keys.length == 2) {
            let relKey = keys[0];
            let key = keys[1];

            if (key == this.referenceIDKey) {
                serverKey = entity.serverRelationshipName(relKey);
            }
        }

        if (serverKey == null) {
            throw ("MIOWebServicePersistentStore: Attribute or Relationship server key is invalid.");
        }

        return serverKey;
    }

    private transfromPredicateComparator(cmp): string {

        switch (cmp) {

            case MIOPredicateComparatorType.Equal:
                return "=";

            case MIOPredicateComparatorType.Less:
                return "<";

            case MIOPredicateComparatorType.LessOrEqual:
                return "<=";

            case MIOPredicateComparatorType.Greater:
                return ">";

            case MIOPredicateComparatorType.GreaterOrEqual:
                return ">=";

            case MIOPredicateComparatorType.Distinct:
                return "!=";

            case MIOPredicateComparatorType.Contains:
                return "like";

            case MIOPredicateComparatorType.NotContains:
                return "not like";
        }

        return "";
    }

    private transfromPredicateOperator(op): string {

        switch (op) {

            case MIOPredicateOperatorType.AND:
                return "and";

            case MIOPredicateOperatorType.OR:
                return "or";
        }

        return "";
    }

    //
    // Server objects -> Managed objects
    //

    private parseServerObjectsForEntity(entityName: string, items, queryID: string, context:MIOManagedObjectContext) {

        let ed: MIOEntityDescription = this.mom.entitiesByName[entityName];

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            let referenceID = item[this.serverReferenceIDKey].toUpperCase(); // Cannot be null
            var mo: MIOManagedObject = this.objectWithReferenceID(referenceID, queryID);
            if (mo == null) {                
                mo = this.delegate.newObjectWithReferenceID(referenceID, entityName, context);
                this.addInsertedObjectInQuery(queryID, mo);
                // We parse the attrbitues and relationships from the sever
                this.parseAttributes(ed.attributes, item, mo);
                this.parseRelationships(ed.relationships, item, mo, queryID);                
                MIONotificationCenter.defaultCenter().postNotification("MIOWebServicePersistentStoreEntityDownloaded", mo, "Inserted");
            }
            else {

                let ts1 = mo.getValue("timestamp");
                let ts2 = item["updatedAt"];

                if (ts2 == null) throw ("MIOWebServicePersistentStore: UpdateAt field from server is null");

                if (ts1 != ts2) {
                    this.addUpdatedObjectInQuery(queryID, mo);
                    this.parseAttributes(ed.attributes, item, mo);
                    this.parseRelationships(ed.relationships, item, mo, queryID);
                    MIONotificationCenter.defaultCenter().postNotification("MIOWebServicePersistentStoreEntityDownloaded", mo, "Updated");
                }
            }
        }
    }

    private parseAttributes(attributes, item, mo: MIOManagedObject) {

        for (var i = 0; i < attributes.length; i++) {
            let attr: MIOAttributeDescription = attributes[i];
            this.parseValueForAttribute(attr, item[attr.serverName], mo);
        }
    }

    private parseValueForAttribute(attribute: MIOAttributeDescription, value, object) {

        // Ignore server id attribute. We take care in other side of the code
        if (attribute.serverName == this.serverReferenceIDKey) return;

        if (value == null && attribute.optional == false) {
            throw ("MIOWebPersistentStore: Couldn't set attribute value (" + object.className + "." + attribute.name + "). Value is nil and it's not optional.");
        }

        if (value == null) return;
        let type = attribute.attributeType;

        if (type == MIOAttributeType.Boolean) {
            if (typeof (value) === "boolean") {
                object.setValue(attribute.name, value);
            }
            else if (typeof (value) === "string") {
                let lwValue = value.toLocaleLowerCase();
                if (lwValue == "yes" || lwValue == "true" || lwValue == "1")
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
        else if (type == MIOAttributeType.Date) {
            object.setValue(attribute.name, this.serverDateFormatter.dateFromString(value));
        }
    }

    private parseRelationships(relationships, item, mo: MIOManagedObject, queryID: string) {

        for (var i = 0; i < relationships.length; i++) {
            let rel: MIORelationshipDescription = relationships[i];

            if (rel.isToMany == false) {

                // spected object
                let referenceID: string = item[rel.serverName];
                if (referenceID == null) continue;

                let obj: MIOManagedObject = this.fetchObjectByReferenceID(referenceID, rel.destinationEntityName, queryID, mo.managedObjectContext);
                mo.setValue(rel.name, obj);
            }
            else {

                let ids = item[rel.serverName];
                if (ids == null) continue;

                for (var j = 0; j < ids.length; j++) {

                    let referenceID: string = ids[j];
                    if (referenceID == null) continue;

                    let obj: MIOManagedObject = this.fetchObjectByReferenceID(referenceID, rel.destinationEntityName, queryID, mo.managedObjectContext);
                    mo.addObject(rel.name, obj);
                }
            }
        }
    }

    insertObjectToServer(obj: MIOManagedObject) {

        let entityName = obj.entity.managedObjectClassName;
        var result = this.delegate.canServerSyncEntityNameForType(entityName, MIOWebServicePersistentIgnoreEntityType.Insert);
        if (result == false) return;

        let entity = this.entityInfoFromName(entityName);

        entity["Status"] = MIOWebServicePersistentStoreStatus.Uploading;
        var count = entity["UploadingCount"];
        count++;
        entity["UploadingCount"] = count;

        let url = this.url.urlByAppendingPathComponent("/" + this.type + "/" + this.identifier + "/" + entityName.toLocaleLowerCase());
        let body = this.serverDataFromObject(obj);
        let httpMethod = "PUT";

        this.webservice.sendRequest(url, body, httpMethod, this, function (code, json) {

            var count = entity["UploadingCount"];
            count--;
            if (count == 0) {
                entity["UploadingCount"] = count;
                entity["Status"] = MIOWebServicePersistentStoreStatus.Ready;
            }

            if (code == 200) {
                let item = json["data"];
                if (item == null) throw ("MIOWebPersistentStore: Server return null item after insert or update");
                this.parseServerObjects(entity, [item], obj.managedObjectContext);
            }
        });
    }

    updateObjectOnServer(obj: MIOManagedObject) {

        let referenceID = this.referenceIDByObjectID[obj.objectID];
        if (referenceID == null) return;

        let entityName = obj.entity.managedObjectClassName;
        var result = this.canServerSyncEntityNameForType(entityName, MIOWebServicePersistentIgnoreEntityType.Update);
        if (result == false) return;

        let entity = this.entityInfoFromName(entityName);

        entity["Status"] = MIOWebServicePersistentStoreStatus.Uploading;
        var count = entity["UploadingCount"];
        count++;
        entity["UploadingCount"] = count;

        let url = this.url.urlByAppendingPathComponent("/" + this.type + "/" + this.identifier + "/" + entityName.toLocaleLowerCase() + "/" + referenceID);
        let body = this.serverDataFromObject(obj);
        let httpMethod = "PATCH";

        this.webservice.sendRequest(url, body, httpMethod, this, function (code, json) {

            var count = entity["UploadingCount"];
            count--;
            if (count == 0) {
                entity["UploadingCount"] = count;
                entity["Status"] = MIOWebServicePersistentStoreStatus.Ready;
            }

            if (code == 200) {
                let item = json["data"];
                if (item == null) throw ("MIOWebPersistentStore: Server return null item after insert or update");
                this.parseServerObjects(entity, [item], obj.managedObjectContext);
            }
        });

    }

    deleteObjectOnServer(obj: MIOManagedObject) {

        let entityName = obj.entity.managedObjectClassName;

        var result = this.delegate.canServerSyncEntityNameForType(entityName, MIOWebServicePersistentIgnoreEntityType.Delete);
        if (result == false) return;

        let referenceID = this.referenceIDByObjectID[obj.objectID];
        if (referenceID == null) return; // It's not comming from the server        

        let entity = this.delegate.entityInfoFromName(entityName);

        entity["Status"] = MIOWebServicePersistentStoreStatus.Uploading;
        var count = entity["UploadingCount"];
        count++;
        entity["UploadingCount"] = count;

        let url = this.url.urlByAppendingPathComponent("/" + this.identifierType + "/" + this.identifier + "/" + entityName.toLocaleLowerCase() + "/" + referenceID.toUpperCase());
        let httpMethod = "DELETE";

        this.sendRequest(url, null, httpMethod, this, function (code, json) {

            var count = entity["UploadingCount"];
            count--;
            if (count == 0) {
                entity["UploadingCount"] = count;
                entity["Status"] = MIOWebServicePersistentStoreStatus.Ready;
            }

            if (code == 200) {
                // this.parseServerObjects(entity, json, context);
                // entity["Status"] = MIOWebServicePersistentStoreStatus.Ready;
                // context.save();
            }
        });
    }

}