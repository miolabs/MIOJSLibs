
/// <reference path="../MIOData/MIOData.ts" />
/// <reference path="MWSPersistenStoreOperation.ts" />


let MWSPersistentStoreDidChangeEntityStatus = "MWSPersistentStoreDidChangeEntityStatus";

enum MWSPersistentStoreFetchStatus{
    None,
    Downloading,
    Downloaded
}

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

        let node = this.nodeWithServerID(serverID, objectID.entity);
        if (node.version == -1){
            this.fetchObjectWithReferenceID(serverID, objectID.entity.name, context);            
        }

        return node;
    }

    newValueForRelationship(relationship: MIORelationshipDescription, objectID: MIOManagedObjectID, context?: MIOManagedObjectContext) {

        let serverID = this.referenceObjectForObjectID(objectID);
        let referenceID = objectID.entity.name + "://" + serverID;

        if (referenceID == null) throw ("MWSPersistentStore: Asking objectID without referenceID");

        let node:MIOIncrementalStoreNode = this.nodesByReferenceID[referenceID];

        let relationName = relationship.name;
        
        if (relationship.isToMany == false) {

            let relRefID = node.valueForPropertyDescription(relationship);
            if (relRefID == null) return null;
            
            let relNode = this.nodeWithServerID(relRefID, relationship.destinationEntity);
            if (relNode == null) {
                relNode = this.newNodeWithValuesAtServerID(relRefID, {}, -1, relationship.destinationEntity);
                //this.fetchObjectWithReferenceID(relRefID, relationship.destinationEntityName, context);
                //MIOLog("Downloading REFID: " + relRefID);
            }            
            return relNode.objectID;
        }
        else {                        
            let relRefIDs = node.valueForPropertyDescription(relationship);
            if (relRefIDs == null) return null;        

            var array = [];
            for (let count = 0; count < relRefIDs.length; count++) {

                let relRefID = relRefIDs[count];
                let relNode = this.nodeWithServerID(relRefID, relationship.destinationEntity);
                if (relNode == null) {                    
                    relNode = this.newNodeWithValuesAtServerID(relRefID, {}, -1, relationship.destinationEntity);
                    //this.fetchObjectWithReferenceID(relRefID, relationship.destinationEntityName, context);
                    //MIOLog("Downloading REFID: " + relRefID);
                }
                array.push(relNode.objectID);
            }
            return array;
        }

    }

    obtainPermanentIDsForObjects(objects){
        var array = [];

        for (var index = 0; index < objects.length; index++){
            let obj:MIOManagedObject = objects[index];
            let serverID = this.delegate.serverIDForObject(this, obj);
            let objID = this.newObjectIDForEntity(obj.entity, serverID);
            array.addObject(objID);
        }
        
        return array;
    }

    managedObjectContextDidRegisterObjectsWithIDs(objectIDs){
    }

    managedObjectContextDidUnregisterObjectsWithIDs(objectIDs){
    }
            
    _fetchObjectWithObjectID(objectID:MIOManagedObjectID, context:MIOManagedObjectContext){        
        let serverID = objectID._getReferenceObject();
        let entityName = objectID.entity.name;        
        this.fetchObjectWithReferenceID(serverID, entityName, context);
    }

    private fetchingObjects = {};
    private fetchObjectWithReferenceID(referenceID: string, entityName: string, context: MIOManagedObjectContext) {

        if (this.delegate == null) return;

        if (this.fetchingObjects[referenceID] != null) return;
        
        this.fetchingObjects[referenceID] = true;
        MIOLog("Downloading REFID: " + referenceID);

        var fetchRequest = MIOFetchRequest.fetchRequestWithEntityName(entityName);
        fetchRequest.entity = MIOEntityDescription.entityForNameInManagedObjectContext(entityName, context);

        let request = this.delegate.fetchRequestForWebStore(this, fetchRequest, referenceID);
        if (request == null) return;

        MIONotificationCenter.defaultCenter().postNotification(MWSPersistentStoreDidChangeEntityStatus, entityName, {"Status" : MWSPersistentStoreFetchStatus.Downloading});

        request.send(this, function (code, data) {
            var [result, values] = this.delegate.requestDidFinishForWebStore(this, fetchRequest, code, data);
            
            MIOLog("Downloaded REFID: " + referenceID);
            delete this.fetchingObjects[referenceID];
            
            if (result == true) {
                this.updateObjectInContext(values, fetchRequest.entity, context);                
            }
            MIONotificationCenter.defaultCenter().postNotification(MWSPersistentStoreDidChangeEntityStatus, entityName, {"Status" : MWSPersistentStoreFetchStatus.Downloaded});
        });
    }

    fetchObjects(fetchRequest: MIOFetchRequest, context: MIOManagedObjectContext, target?, completion?) {

        let entityName = fetchRequest.entity.name;

        if (this.delegate == null) return;

        let request = this.delegate.fetchRequestForWebStore(this, fetchRequest, null);
        if (request == null) return;

        MIONotificationCenter.defaultCenter().postNotification(MWSPersistentStoreDidChangeEntityStatus, entityName, {"Status" : MWSPersistentStoreFetchStatus.Downloading});

        var objects = null;

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

                objects = this.updateObjectsInContext(items, fetchRequest.entity, context, array);
            }
            MIONotificationCenter.defaultCenter().postNotification(MWSPersistentStoreDidChangeEntityStatus, entityName, {"Status" : MWSPersistentStoreFetchStatus.Downloaded});            

            if (target != null && completion != null){
                completion.call(target, objects);
            }
        });
    }

    private updateObjectsInContext(items, entity: MIOEntityDescription, context: MIOManagedObjectContext, relationshipEntities) {

        if (context == null) return;
        if (items == null) return;

        var objects = [];

        context.performBlockAndWait(this, function () {

            for (var index = 0; index < items.length; index++) {

                let objectValues = items[index];
                let obj = this.updateObjectInContext(objectValues, entity, context, null, relationshipEntities);
                                        
                objects.addObject(obj);
            }
        });

        return objects;
    }

    private updateObjectInContext(values, entity: MIOEntityDescription, context: MIOManagedObjectContext, objectID?:MIOManagedObjectID, relationshipEntities?) {

        // Check the objects inside values
        let relationshipsObjects = relationshipEntities != null ? relationshipEntities : [];
        this.checkRelationships(values, entity, context, relationshipsObjects);

        let serverID = this.delegate.serverIDForItem(this, values, entity.name);
        if (serverID == null) return null;
        
        let version = this.delegate.serverVersionNumberForItem(this, values, entity.name);        

        var node = this.nodeWithServerID(serverID, entity);
        if (node == null) {
            MIOLog("New version: " + entity.name + " (" + version + ")");                        
            node = this.newNodeWithValuesAtServerID(serverID, values, version, entity, objectID);            
        }
        else if (version > node.version){
            MIOLog("Update version: " + entity.name + " (" + node.version + " -> " + version + ")");            
            this.updateNodeWithValuesAtServerID(serverID, values, version, entity);              
        }        

        let obj = context.existingObjectWithID(node.objectID);
        if (obj != null) context.refreshObject(obj, true);                            

        return obj;
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
                
        return node;
    }

    private updateNodeWithValuesAtServerID(serverID:string, values, version, entity:MIOEntityDescription){                
        let referenceID = entity.name + "://" + serverID;
        let node = this.nodesByReferenceID[referenceID];
        node.updateWithValues(values, version);
        MIOLog("Updating REFID: " + referenceID);        
    }

    private deleteNodeAtServerID(serverID:string, entity:MIOEntityDescription){                
        let referenceID = entity.name + "://" + serverID;
        delete this.nodesByReferenceID[referenceID];
        MIOLog("Deleting REFID: " + referenceID);        
    }    

    private checkRelationships(values, entity:MIOEntityDescription, context:MIOManagedObjectContext, relationshipEntities){                
        
        for (var index = 0; index < relationshipEntities.length; index++){
            let relEntity = relationshipEntities[index];
            let serverRelName = this.delegate.serverRelationshipName(this, relEntity.name, entity);
            let value = values[serverRelName];

            if (value == null) continue;

            if (relEntity.isToMany == false) {
                this.updateObjectInContext(value, relEntity.destinationEntity, context);
                let serverID = this.delegate.serverIDForItem(this, value, relEntity.destinationEntity.name);                                
                values[serverRelName] = serverID;
            }
            else {                
                var array = [];
                for (var count = 0; count < value.length; count++){
                    let serverValues = value[count];
                    this.updateObjectInContext(serverValues, relEntity.destinationEntity, context);
                    let serverID = this.delegate.serverIDForItem(this, serverValues, relEntity.destinationEntityName);                
                    array.addObject(serverID);
                }
                values[serverRelName] = array;
            }
        }
    }    

    private saveObjects(request: MIOSaveChangesRequest, context?: MIOManagedObjectContext) {

        if (context == null) return;

        let inserts = request.insertedObjects;
        for (let entityName in inserts) {
            let array = inserts[entityName];
            for (let index = 0; index < array.length; index++) {
                let obj: MIOManagedObject = array[index];                
                this.insertObjectToServer(obj);
            }
        }

        let updates = request.updatedObjects;
        for (let entityName in updates) {
            let array = updates[entityName];
            for (let index = 0; index < array.length; index++) {
                let obj: MIOManagedObject = array[index];
                this.updateObjectOnServer(obj);
            }
        }

        let deletes = request.deletedObjects;
        for (let entityName in deletes) {
            let array = deletes[entityName];
            for (let index = 0; index < array.length; index++) {
                let obj: MIOManagedObject = array[index];
                this.deleteObjectOnServer(obj);                
            }
        }

        this.uploadToServer();
    }

    insertObjectToServer(object: MIOManagedObject) {

        if (this.delegate == null) return;

        let entityName = object.entity.name;
        
        let serverID = this.delegate.serverIDForObject(this, object);
        // We need to create an empty node before we call server Values for object,
        // because inside we call valueForKey that needs the a node.
        this.newNodeWithValuesAtServerID(serverID, {}, -1, object.entity, object.objectID);
        
        // We update the node with the values
        let values = this.delegate.serverValuesForObject(this, object, true);
        this.updateNodeWithValuesAtServerID(serverID, values, 0, object.entity);
        
        var dependencyIDs = [];

        let request = this.delegate.insertRequestForWebStore(this, object, dependencyIDs);
        if (request == null) return;

        var op = new MWSPersistenStoreOperation();
        op.initWithDelegate(this);
        op.request = request;
        op.dependencyIDs = dependencyIDs;
        this.saveOperationsByReferenceID[serverID] = op;

        MIOLog("OPERATION: Insert " + object.entity.name + " -> " + serverID);

        op.target = this;
        op.completion = function () {
            delete this.saveOperationsByReferenceID[serverID];            
            MIOLog("OPERATION: Insert " + object.entity.name + " -> " + serverID + " (OK)");

            let [result, values] = this.delegate.requestDidFinishForWebStore(this, null, op.responseCode, op.responseJSON);
            let version = this.delegate.serverVersionNumberForItem(this, values);
            MIOLog("Object " + serverID + " -> Insert " + (result ? "OK" : "FAIL") + " (" + version + ")");                     
            if (version > 0) this.updateObjectInContext(values, object.entity, object.managedObjectContext, object.objectID);
        }  
    }

    private updateObjectOnServer(object: MIOManagedObject) {

        if (this.delegate == null) return;

        let entityName = object.entity.name;
        
        let serverID = this.delegate.serverIDForObject(this, object);
        let values = this.delegate.serverValuesForObject(this, object, true);
        
        let node = this.nodeWithServerID(serverID, object.entity);        
        this.updateNodeWithValuesAtServerID(serverID, values, node.version + 1, object.entity);
        
        var dependencyIDs = [];

        let request = this.delegate.updateRequestForWebStore(this, object, dependencyIDs);
        if (request == null) return;

        var op = new MWSPersistenStoreOperation();
        op.initWithDelegate(this);
        op.request = request;
        op.dependencyIDs = dependencyIDs;
        this.saveOperationsByReferenceID[serverID] = op;

        MIOLog("OPERATION: Update " + object.entity.name + " -> " + serverID);

        op.target = this;
        op.completion = function () {
            delete this.saveOperationsByReferenceID[serverID];
            MIOLog("OPERATION: Update " + object.entity.name + " -> " + serverID + "(OK)");

            let [result] = this.delegate.requestDidFinishForWebStore(this, null, op.responseCode, op.responseJSON);
            let version = this.delegate.serverVersionNumberForItem(this, values);            
            MIOLog("Object " + serverID + " -> Update " + (result ? "OK" : "FAIL") + " (" + version + ")");
            if (version > node.version) this.updateObjectInContext(values, object.entity, object.managedObjectContext, object.objectID);
        }        
    }

    deleteObjectOnServer(object: MIOManagedObject) {

        if (this.delegate == null) return;

        let entityName = object.entity.name;
        
        let serverID = this.delegate.serverIDForObject(this, object);
        let node = this.nodeWithServerID(serverID, object.entity);        
        this.deleteNodeAtServerID(serverID, object.entity);
        
        let request = this.delegate.deleteRequestForWebStore(this, object);
        if (request == null) return;

        var op = new MWSPersistenStoreOperation();
        op.initWithDelegate(this);
        op.request = request;
        op.dependencyIDs = [];
        this.saveOperationsByReferenceID[serverID] = op;

        MIOLog("OPERATION: Delete " + object.entity.name + " -> " + serverID);

        op.target = this;
        op.completion = function () {
            delete this.saveOperationsByReferenceID[serverID];
            MIOLog("OPERATION: Delete " + object.entity.name + " -> " + serverID + "(OK)");

            let [result] = this.delegate.requestDidFinishForWebStore(this, null, op.responseCode, op.responseJSON);
            //let version = this.delegate.serverVersionNumberForItem(this, values);
            MIOLog("Object " + serverID + " -> Deleted " + (result ? "OK" : "FAIL"));                     
        }  
    }

    //
    // App to server comunication
    //

    private fetchOperationQueue:MIOOperationQueue = null;
    private fetchFromServer(){
        if (this.fetchOperationQueue == null) {
            this.fetchOperationQueue = new MIOOperationQueue();
            this.fetchOperationQueue.init();
        }        
    }

    private saveOperationQueue:MIOOperationQueue = null;
    private saveOperationsByReferenceID = {};

    private checkOperationDependecies(operation: MWSPersistenStoreOperation, dependencies) {

        for (var index = 0; index < dependencies.length; index++) {
            let referenceID = dependencies[index];
            let op = this.saveOperationsByReferenceID[referenceID];
            if (op == null) continue;
            operation.addDependency(op);
        }
    }
    
    private uploadToServer() {

        if (this.saveOperationQueue == null) {
            this.saveOperationQueue = new MIOOperationQueue();
            this.saveOperationQueue.init();

            this.saveOperationQueue.addObserver(this, "operationCount", null);
        }

        for (var refID in this.saveOperationsByReferenceID) {
            let op = this.saveOperationsByReferenceID[refID];
            this.checkOperationDependecies(op, op.dependencyIDs);
            this.saveOperationQueue.addOperation(op);
        }
    }

}