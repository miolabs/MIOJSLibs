
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
    private referenceIDByObjectsID = {};
    private objectIDByReferenceID = {};

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

        let serverID = this.referenceObjectForObjectID(objectID);
        let referenceID = objectID.entity.name + "://" + serverID;

        if (referenceID == null) throw ("MWSPersistentStore: Asking objectID without referenceID");

        return this.nodesByReferenceID[referenceID];
    }

    newValueForRelationship(relationship: MIORelationshipDescription, objectID: MIOManagedObjectID, context?: MIOManagedObjectContext) {

        let serverID = this.referenceObjectForObjectID(objectID);
        let referenceID = objectID.entity.name + "://" + serverID;

        if (referenceID == null) throw ("MWSPersistentStore: Asking objectID without referenceID");

        let node:MIOIncrementalStoreNode = this.nodesByReferenceID[referenceID];

        let relationName = relationship.name;
        
        if (relationship.isToMany == false) {

            var relRefID = node.valueForPropertyDescription(relationship);
            if (relRefID == null) return null;
            
            let relNode = this.nodeWithServerID(relRefID, relationship.destinationEntity);
            if (relNode == null) {
                relNode = this.newNodeWithValuesAtServerID(relRefID, {}, -1, relationship.destinationEntity);
                this.fetchObjectWithReferenceID(relRefID, relationship.destinationEntityName, context);
                MIOLog("Downloading REFID: " + relRefID);
            }            
            return relNode.objectID;
        }
        else {
            let relRefIDs = node.valueForPropertyDescription(relationship);
            if (relRefIDs == null) return null;

            var array = [];

            // for (var count = 0; count < relRefIDs.length; count++) {

            //     let relRefID = relRefIDs[count];
            //     let relNode = this.newNodeWithValuesAtServerID(relRefID, {}, -1, relationship.destinationEntity);
            //     this.fetchObjectWithReferenceID(relRefID, relationship.destinationEntityName, context);
            //     MIOLog("Downloading REFID: " + relRefID);
            //     array.push(relNode.objectID);
            // }
            return array;
        }

    }

    obtainPermanentIDsForObjects(objects){

        var array = [];

        for (var index = 0; index < objects.length; index++){
            let obj:MIOManagedObject = objects[index];
            let referenceID = this.delegate.serverIDForObject(this, obj);
            let objID = this.newObjectIDForEntity(obj.entity, referenceID);
            array.addObject(objID);
        }
        
        return array;
    }
            
    _fetchObjectWithObjectID(objectID:MIOManagedObjectID, context:MIOManagedObjectContext){        
        let serverID = objectID._getReferenceObject();
        let entityName = objectID.entity.name;        
        this.fetchObjectWithReferenceID(serverID, entityName, context);
    }

    private fetchObjectWithReferenceID(referenceID: string, entityName: string, context: MIOManagedObjectContext) {

        //let node = this.nodesByReferenceID[referenceID];
        //if (node != null) return node.objectID;

        if (this.delegate == null) return;

        var fetchRequest = MIOFetchRequest.fetchRequestWithEntityName(entityName);
        fetchRequest.entity = MIOEntityDescription.entityForNameInManagedObjectContext(entityName, context);

        let request = this.delegate.fetchRequestForWebStore(this, fetchRequest, referenceID);
        if (request == null) return;

        request.send(this, function (code, data) {
            var [result, values] = this.delegate.requestDidFinishForWebStore(this, fetchRequest, code, data);
            if (result == true) {
                if (entityName == "Product"){
                     MIOLog("???");
                }
                this.updateObjectInContext(values, fetchRequest.entity, context);
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
                    let rel = fetchRequest.entity.relationshipsByName[relname];
                    if (rel != null)
                        array.push(rel);
                }

                this.updateObjectsInContext(items, fetchRequest.entity, context, array);
            }
        });
    }

    private updateObjectsInContext(items, entity: MIOEntityDescription, context: MIOManagedObjectContext, relationshipEntities) {

        if (context == null) return;
        if (items == null) return;

        context.performBlockAndWait(this, function () {

            for (var index = 0; index < items.length; index++) {

                let objectValues = items[index];
                let updated = this.updateObjectInContext(objectValues, entity, context);
                                        
                if (updated == true) {
                    let relationshipsObjects = relationshipEntities != null ? relationshipEntities : [];
                    this.checkRelationships(objectValues, entity, context, relationshipsObjects);
                }                
            }
        });
    }

    private updateObjectInContext(values, entity: MIOEntityDescription, context: MIOManagedObjectContext, objectID?:MIOManagedObjectID):boolean {

        var updateContext = false;

        let serverID = this.delegate.serverIDForItem(this, values, entity.name);
        if (serverID == null) return;
        
        let version = this.delegate.serverVersionNumberForItem(this, values, entity.name);
        
        var node = this.nodeWithServerID(serverID, entity);
        if (node == null) {
            node = this.newNodeWithValuesAtServerID(serverID, values, version, entity, objectID);
            updateContext = true;
        }
        else if (version > node.version){
            this.updateNodeWithValuesAtServerID(serverID, values, version, entity);  
            updateContext = true;
        }        

        let obj = context.existingObjectWithID(node.objectID);
        if (obj != null) context.refreshObject(obj, true);                            

        return updateContext;
    }

    private nodeWithServerID(serverID:string, entity:MIOEntityDescription){    
        let referenceID = entity.name + "://" + serverID;
        return this.nodesByReferenceID[referenceID];
    }

    private newNodeWithValuesAtServerID(serverID:string, values, version, entity:MIOEntityDescription, objectID?:MIOManagedObjectID){        
        let referenceID = entity.name + "://" + serverID;

        let objID = objectID != null ? objectID : this.newObjectIDForEntity(entity, serverID);

        var node = new MIOIncrementalStoreNode();
        node.initWithObjectID(objID, values, version);
        this.nodesByReferenceID[referenceID] = node;
        MIOLog("Inserting REFID: " + referenceID);   
        
        // Only for temporary
        // if (objectID != null) {
        //     this.referenceIDByObjectsID[objID.identifier] = referenceID;
        // }
        
        return node;
    }

    private updateNodeWithValuesAtServerID(serverID:string, values, version, entity:MIOEntityDescription){                
        let referenceID = entity.name + "://" + serverID;
        let node = this.nodesByReferenceID[referenceID];
        node.updateWithValues(values, version);
        MIOLog("Updating REFID: " + referenceID);        
    }

    private checkRelationships(values, entity:MIOEntityDescription, context:MIOManagedObjectContext, relationshipEntities){                
        
        return;
        
        let relationships = entity.relationships;
        for (var index = 0; index < relationships.length; index++){
            let relEntity = relationships[index];
            //let serverRelname = relEntity.serverName[relEntity.name];
            let serverRelName = this.delegate.serverRelationshipName(this, relEntity.name, entity);
            let value = values[serverRelName];

            if (relEntity.isToMany == false) {
                if (relationshipEntities.containsObject(relEntity.destinationEntityName)){                    
                    // Value is a object
                    //this.updateObjectInContext(value, relEntity.destinationEntity, context);                    
                    //values[serverRelName] = value;
                }
                else {
                    // Value is a server id
                    // let referenceID = relEntity.destinationEntityName + "://" + value;
                    // var node = this.nodesByReferenceID[referenceID];
                    // if (node == null) {                         
                    //     let objID = this.newObjectIDForEntity(relEntity.destinationEntity, value);
                    //     this.newNodeWithValuesAtServerID(value, {}, -1, relEntity.destinationEntity, objID);
                    //     this.fetchObjectWithReferenceID(value, relEntity.destinationEntityName, context);                         
                    //     values[relEntity.name] = objID;
                    // }
                    // else {
                    //     values[relEntity.name] = node.objectID;
                    // }
                }
            }
            else {
                var array = [];
                if (value != null) {
                    // for (var count = 0; count < value.length; count++){
                    //     let serverValues = array[count];              
                    //     if (serverValues == null) continue;    
                    //     let node = this.updateObjectInContext(serverValues, relEntity, context);
                    // }
                }
                //values[relEntity.name] = array;
            }
        }
    }    

    private saveObjects(request: MIOSaveChangesRequest, context?: MIOManagedObjectContext) {

        if (context == null) return;

        let inserts = request.insertedObjects;
        for (var entityName in inserts) {
            var array = inserts[entityName];
            for (var index = 0; index < array.length; index++) {
                let obj: MIOManagedObject = array[index];                
                this.insertObjectToServer(obj);
            }
        }

        let updates = request.updatedObjects;
        for (var entityName in updates) {
            var array = updates[entityName];
            for (var index = 0; index < array.length; index++) {
                let obj: MIOManagedObject = array[index];
                this.updateObjectOnServer(obj);
            }
        }

        let deletes = request.deletedObjects;
        for (var index = 0; index < deletes.length; index++) {
            let obj: MIOManagedObject = deletes[index];
            this.deleteObjectOnServer(obj);
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

        if (this.delegate == null) return;

        let entityName = object.entity.name;
        
        let serverID = this.delegate.serverIDForObject(this, object);
        let values = this.delegate.serverValuesForObject(this, object, true);
        
        this.newNodeWithValuesAtServerID(serverID, values, 0, object.entity, object.objectID);
        // var refID:string = this.referenceObjectForObjectID(object.objectID);
        // if (refID != null) {
        //     let removeEnityName = object.entity.name + "://";
        //     refID = refID.replace(removeEnityName, '');
        // }

        var dependencyIDs = [];

        let request = this.delegate.insertRequestForWebStore(this, object, serverID, dependencyIDs);
        if (request == null) return;

        var op = new MWSPersistenStoreUploadOperation();
        op.initWithDelegate(this);
        op.request = request;
        op.dependencyIDs = dependencyIDs;
        this.operationsByReferenceID[serverID] = op;

        op.target = this;
        op.completion = function () {
            delete this.operationsByReferenceID[serverID];
            
            let [result, values] = this.delegate.requestDidFinishForWebStore(this, null, op.responseCode, op.responseJSON);
            MIOLog("Object " + serverID + " -> Insert " + (result ? "OK" : "FAIL"));         
            let version = this.delegate.serverVersionNumberForItem(values);
            if (version > 0) this.updateObjectInContext(values, object.entity, object.managedObjectContext, object.objectID);
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