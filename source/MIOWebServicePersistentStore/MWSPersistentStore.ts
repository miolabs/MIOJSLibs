
/// <reference path="../MIOData/MIOData.ts" />

enum MWSPersistentStoreRequestType {
    Fetch,
    Insert,
    Update,
    Delete
}

enum MWSPersistentStoreError {
    NoStoreURL,
    InvalidRequest
}

class MWSPersistentStore extends MIOIncrementalStore {
    static get type(): string { return "MWSPersistentStore"; }
    get type(): string { return MWSPersistentStore.type; }

    delegate = null;

    private storeURL: MIOURL = null;
    private entitiesInfo = {};
    private nodesByReferenceID = {};

    loadMetadata(): MIOError {

        if (this.url == null) throw "MWSPersistentStoreError.NoStoreURL";
        this.storeURL = this.url;

        let uuid = MIOUUID.uuid();
        let metadata = { MIOStoreUUIDKey: uuid, MIOStoreTypeKey: "MWSPersistentStore" };
        this.metadata = metadata;

        return null;
    }

    executeRequest(request: MIOPersistentStoreRequest, context: MIOManagedObjectContext) {

        if (request instanceof MIOFetchRequest) {
            this.fetchObjects(request as MIOFetchRequest, context);
            return [];
        }
        else if (request instanceof MIOSaveChangesRequest) {
            this.saveObjects(request as MIOSaveChangesRequest, context);
            return [];
        }
        else {
            throw "MWSPersistentStoreError.InvalidRequest";
        }
    }

    newValuesForObjectWithID(objectID: MIOManagedObjectID, context: MIOManagedObjectContext): MIOIncrementalStoreNode {

        var refID = this.referenceObjectForObjectID(objectID);
        if (refID == null) throw ("MWSPersistentStore: Asking objectID without referenceID");

        var node = this.nodesByReferenceID[refID];
        if (node != null) return node;

        node.initWithObjectID(objectID, {}, 1);
        return node;
    }

    newValueForRelationship(relationship: MIORelationshipDescription, objectID: MIOManagedObjectID, context?: MIOManagedObjectContext) {

        let relationName = relationship.name;
        var refID = this.referenceObjectForObjectID(objectID);
        if (refID == null) throw ("MWSPersistentStore: Asking objectID without referenceID");

        let objNode = this.nodesByReferenceID[refID];
        if (relationship.isToMany == false) {

            var relRefID = objNode.values[relationship.serverName];
            if (relRefID == null) return null;

            let relReferenceID = relationship.destinationEntityName + "://" + relRefID;
            let relNode = this.nodesByReferenceID[relReferenceID];
            if (relNode == null) {
                let relID = this.newObjectIDForEntity(relationship.destinationEntity, relReferenceID);
                relNode = new MIOIncrementalStoreNode();
                relNode.initWithObjectID(relID, {}, 1);
                this.nodesByReferenceID[relReferenceID] = relNode;
                this.fetchObjectWithReferenceID(relRefID, relationship.destinationEntityName, context);
                MIOLog("Downloading REFID: " + relReferenceID);
                return relID;
            }
            else {
                return relNode.objectID;
            }
        }
        else {
            let relRefIDs = objNode.values[relationship.serverName];
            if (relRefIDs == null) return null;

            var array = [];

            for (var count = 0; count < relRefIDs.length; count++) {

                let relRefID = relRefIDs[count];
                let objID = this.objectIDFromReferenceID(relRefID, relationship, context);
                array.push(objID);
            }

            return array;
        }

    }

    private objectIDFromReferenceID(referenceID: string, relationship: MIORelationshipDescription, context: MIOManagedObjectContext) {

        let relReferenceID = relationship.destinationEntityName + "://" + referenceID;
        let relNode = this.nodesByReferenceID[relReferenceID];
        if (relNode == null) {
            let relID = this.newObjectIDForEntity(relationship.destinationEntity, relReferenceID);
            relNode = new MIOIncrementalStoreNode();
            relNode.initWithObjectID(relID, {}, 1);
            this.nodesByReferenceID[relReferenceID] = relNode;
            this.fetchObjectWithReferenceID(referenceID, relationship.destinationEntityName, context);
            MIOLog("Downloading REFID: " + relReferenceID);
            return relID;
        }
        else {
            return relNode.objectID;
        }
    }

    private fetchObjectWithReferenceID(referenceID: string, entityName: string, context: MIOManagedObjectContext) {
        if (this.delegate == null) return;

        var fetchRequest = MIOFetchRequest.fetchRequestWithEntityName(entityName);
        fetchRequest.entity = MIOEntityDescription.entityForNameInManagedObjectContext(entityName, context);

        let request = this.delegate.fetchRequestForWebStore(this, fetchRequest, referenceID);
        if (request == null) return;

        request.send(this, function (code, data) {
            var [result, items] = this.delegate.requestDidFinishForWebStore(this, fetchRequest, code, data);
            if (result == true) {
                this.updateObjects([items], fetchRequest.entity, context, []);
            }
        });

    }

    private fetchObjects(fetchRequest: MIOFetchRequest, context?: MIOManagedObjectContext) {

        let entityName = fetchRequest.entity.name;

        if (this.delegate == null) return;

        let request = this.delegate.fetchRequestForWebStore(this, fetchRequest, null);
        if (request == null) return;

        request.send(this, function (code, data) {
            var [result, items] = this.delegate.requestDidFinishForWebStore(this, fetchRequest, code, data);
            if (result == true) {
                // Transform relationships into server keys
                let relationships = fetchRequest.relationshipKeyPathsForPrefetching;
                var array = [];
                for (var index = 0; index < relationships.length; index++) {
                    var relname = relationships[index];
                    //MIOEntityDescription.entityForNameInManagedObjectContext(entityName, this);
                    let rel = fetchRequest.entity.relationshipsByName[relname];
                    if (rel != null)
                        array.push(rel);
                }

                this.updateObjects(items, fetchRequest.entity, context, array);
            }
        });

    }

    private updateObjects(items, entity: MIOEntityDescription, context: MIOManagedObjectContext, relationshipEntities) {

        if (context == null) return;
        if (items == null) return;

        context.performBlockAndWait(this, function () {

            for (var index = 0; index < items.length; index++) {

                let objectValues = items[index];
                let serverID = this.delegate.referenceIDForItem(this, objectValues, entity.name);
                if (serverID == null) continue;
                
                let version = this.delegate.versionNumberForItem(this, objectValues, entity.name);
                this.updateNodeObjectForServerID(serverID, objectValues, version, entity, context, relationshipEntities);

                // let node = this.nodeObjectForServerID(serverID, objectValues, version, entity, context, relationshipEntities)
                // let obj = context.existingObjectWithID(node.objectID);
                // if (obj != null) context.refreshObject(obj, true);
            }
        });

    }

    updateNodeObjectForServerID(serverID:string, values, version, entity:MIOEntityDescription, context:MIOManagedObjectContext, relationshipEntities){

        var isUpdated = false;

        let refID = entity.name + "://" + serverID;
        var node = this.nodesByReferenceID[refID];
        if (node == null) {
            //this.itemsByReferenceID[refID] = objectValues;  
            let objID = this.newObjectIDForEntity(entity, refID);

            node = new MIOIncrementalStoreNode();
            node.initWithObjectID(objID, values, version);
            this.nodesByReferenceID[refID] = node;
            MIOLog("Inserting REFID: " + refID);
            isUpdated = true;
        }
        else if (version >= node.version) {
            node.updateWithValues(values, version);
            MIOLog("Updating REFID: " + refID);
            isUpdated = true;
        }
        else {
            MIOLog("Ignoring REFID: " + refID);
            return node;
        }      
        
        // Check relationships values
        for (var index = 0; index < relationshipEntities.length; index++){
            let relEntity = relationshipEntities[index];
            //let serverRelname = relEntity.serverName[relEntity.name];
            let serverRelname = this.delegate.serverRelationshipName(this, relEntity.name, entity);
            if (relEntity.isToMany == false) {
                let serverValues = values[serverRelname];
                if (serverValues == null) continue;

                let relServerID = this.delegate.referenceIDForItem(this, serverValues, relEntity.name);
                if (relServerID == null) continue;

                let relVersion = this.delegate.versionNumberForItem(this, serverValues, entity.name);

                this.updateNodeObjectForServerID(relServerID, serverValues, relVersion, relEntity.destinationEntity, null, []);
                // let obj = context.existingObjectWithID(node.objectID);
                // if (obj != null) context.refreshObject(obj, true);
            }
            else {
                var array = values[serverRelname];
                for (var count = 0; count < array.length; count++){
                    let serverValues = array[count];              
                    if (serverValues == null) continue;
    
                    let serverID = this.delegate.serverIDForItem(this, serverValues, relEntity.name);
                    if (serverID == null) continue;

                    let serverVersion = this.delegate.versionNumberForItem(this, serverValues, entity.name);
    
                    this.updateNodeObjectForServerID(serverID, serverValues, serverVersion, relEntity, null, []);
                    // let obj = context.existingObjectWithID(node.objectID);
                    // if (obj != null) context.refreshObject(obj, true);
                }
            }
        }

        if (isUpdated == true){
            let obj = context.existingObjectWithID(node.objectID);
            if (obj != null) context.refreshObject(obj, true);
        }

        return node;
    }

    private saveObjects(request: MIOSaveChangesRequest, context?: MIOManagedObjectContext) {

        if (context == null) return;

        let inserts = request.insertedObjects;
        for (var entityName in inserts) {
            var array = inserts[entityName];
            for (var index = 0; index < array.length; index++) {
                let obj: MIOManagedObject = array[index];
                this.insertObjectToServer(obj);
                //obj.isFault = false;
                obj.saveChanges();
            }
        }

        let updates = request.updatedObjects;
        for (var entityName in updates) {
            var array = updates[entityName];
            for (var index = 0; index < array.length; index++) {
                let obj: MIOManagedObject = array[index];
                this.updateObjectOnServer(obj);
                //obj.isFault = false;
                obj.saveChanges();
            }
        }

        let deletes = request.deletedObjects;
        for (var index = 0; index < deletes.length; index++) {
            let obj: MIOManagedObject = deletes[index];
            this.deleteObjectOnServer(obj);
            obj.isFault = false;
        }

        this.uploadToServer();
    }

    //
    // App to server comunication
    //

    private uploadOperationQueue:MIOOperationQueue = null;
    private operationsByReferenceID = {};

    checkOperationDependecies(operation: MWPSUploadOperation, dependencies) {

        for (var index = 0; index < dependencies.length; index++) {
            let referenceID = dependencies[index];
            let op = this.operationsByReferenceID[referenceID];
            if (op == null) continue;
            operation.addDependency(op);
        }
    }
    
    uploadToServer() {

        if (this.uploadOperationQueue == null) {
            this.uploadOperationQueue = new MIOOperationQueue();
            this.uploadOperationQueue.init();
        }

        for (var refID in this.operationsByReferenceID) {
            let op = this.operationsByReferenceID[refID];
            this.checkOperationDependecies(op, op.dependencyIDs);
            this.uploadOperationQueue.addOperation(op);
        }
    }

    insertObjectToServer(object: MIOManagedObject) {
/*
        let referenceID = obj.valueForKey(this.referenceIDKey);
        if (referenceID == null) return;

        let entityName = obj.entity.managedObjectClassName;
        var result = this.delegate.canServerSyncEntityNameForType(entityName, MIOWebServicePersistentIgnoreEntityType.Insert);
        if (result == false) return;

        var dependencies = [];

        var op = new MWPSUploadOperation();
        op.initWithDelegate(this);
        op.url = this.url.urlByAppendingPathComponent("/" + this.identifierType + "/" + this.identifier + "/" + entityName.toLocaleLowerCase());
        op.httpMethod = "PUT"
        op.body = this.serverDataFromObject(obj, false, dependencies);
        op.dependencyIDs = dependencies;

        this.operationsByReferenceID[referenceID] = op;

        op.target = this;
        op.completion = function () {
            delete this.operationsByReferenceID[referenceID];

            let item = op.responseJSON["data"];
            let queryID = this.queryByID(null);
            this.parseServerObjectsForEntity(entityName, [item], queryID, obj.managedObjectContext);
            let query = this.queries[queryID];
            query["Count"] = query["Count"] - 1;
            this.checkQueryByID(queryID, obj.managedObjectContext);
        }
        */

        if (this.delegate == null) return;

        let entityName = object.entity.name;
        var refID:string = this.referenceObjectForObjectID(object.objectID);
        if (refID != null) {
            let removeEnityName = object.entity.name + "://";
            refID = refID.replace(removeEnityName, '');
        }

        var dependencyIDs = [];

        let request = this.delegate.insertRequestForWebStore(this, object, refID, dependencyIDs);
        if (request == null) return;

        var op = new MWSPersistenStoreUploadOperation();
        op.initWithDelegate(this);
        op.request = request;
        op.dependencyIDs = dependencyIDs;
        this.operationsByReferenceID[refID] = op;

        op.target = this;
        op.completion = function () {
            delete this.operationsByReferenceID[refID];
            
            let [result] = this.delegate.requestDidFinishForWebStore(this, null, op.responseCode, op.responseJSON);
            MIOLog("Object " + refID + " -> Insert " + (result ? "OK" : "FAIL"));
        }  
    }

    private updateObjectOnServer(object: MIOManagedObject) {

        if (this.delegate == null) return;

        let entityName = object.entity.name;
        var refID:string = this.referenceObjectForObjectID(object.objectID);
        let removeEnityName = object.entity.name + "://";
        refID = refID.replace(removeEnityName, '');

        var dependencyIDs = [];

        let request = this.delegate.updateRequestForWebStore(this, object, refID, dependencyIDs);
        if (request == null) return;

        var op = new MWSPersistenStoreUploadOperation();
        op.initWithDelegate(this);
        op.request = request;
        op.dependencyIDs = dependencyIDs;
        this.operationsByReferenceID[refID] = op;

        op.target = this;
        op.completion = function () {
            delete this.operationsByReferenceID[refID];
            let [result] = this.delegate.requestDidFinishForWebStore(this, null, op.responseCode, op.responseJSON);
            MIOLog("Object " + refID + " -> Update " + (result ? "OK" : "FAIL"));
        }        
    }

    deleteObjectOnServer(obj: MIOManagedObject) {

        /*
        let referenceID = obj.valueForKey(this.referenceIDKey);
        if (referenceID == null) return;

        let entityName = obj.entity.managedObjectClassName;
        var result = this.delegate.canServerSyncEntityNameForType(entityName, MIOWebServicePersistentIgnoreEntityType.Delete);
        if (result == false) return;


        var dependencies = [];

        var op = new MWPSUploadOperation();
        op.initWithDelegate(this);
        op.url = this.url.urlByAppendingPathComponent("/" + this.identifierType + "/" + this.identifier + "/" + entityName.toLocaleLowerCase() + "/" + referenceID.toUpperCase());
        op.httpMethod = "DELETE"
        //op.body = null; 
        this.serverDataFromObject(obj, false, dependencies);
        op.dependencyIDs = dependencies;

        this.operationsByReferenceID[referenceID] = op;

        op.target = this;
        op.completion = function () {
            delete this.operationsByReferenceID[referenceID];
        }

        */
    }

}