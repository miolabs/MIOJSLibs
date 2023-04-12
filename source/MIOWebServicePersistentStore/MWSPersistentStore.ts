import { MIOURL, MIOError, MIOUUID, MIONotificationCenter, MIOLog, MIOOperationQueue } from "../MIOFoundation";
import { MIOPersistentStoreRequest } from "../MIOData/MIOPersistentStoreRequest";
import { MIOManagedObjectID } from "../MIOData/MIOManagedObjectID";
import { MIORelationshipDescription } from "../MIOData/MIORelationshipDescription";
import { MWSPersistenStoreOperation } from "./MWSPersistenStoreOperation";
import { MIOIncrementalStore } from "../MIOData/MIOIncrementalStore";
import { MIOIncrementalStoreNode } from "../MIOData/MIOIncrementalStoreNode";
import { MIOFetchRequest } from "../MIOData/MIOFetchRequest";
import { MIOManagedObject } from "../MIOData/MIOManagedObject";
import { MIOEntityDescription } from "../MIOData/MIOEntityDescription";
import { MIOManagedObjectContext } from "../MIOData/MIOManagedObjectContext";
import { MIOSaveChangesRequest } from "../MIOData/MIOSaveChangesRequest";
import { MWSRequest, MWSRequestType } from "./MWSRequest";
import { MWSJSONRequest } from "./MWSJSONRequest";
import { MIOManagedObjectSet } from "../MIOData/MIOManagedObjectSet";
import { MIOCoreObjectClone } from "../MIOCore"
import { MWSCache } from "./MWSCache"

export let MWSPersistentStoreDidChangeEntityStatus = "MWSPersistentStoreDidChangeEntityStatus";
export let MWSPersistentStoreDidUpdateEntity = "MWSPersistentStoreDidUpdateEntity";
export let MWSPersistentStoreSaveOperationError = "MWSPersistentStoreSaveOperationError";

export enum MWSPersistentStoreFetchStatus{
    None,
    Downloading,
    Downloaded
}

export enum MWSPersistentStoreRequestType {
    Fetch,
    Insert,
    Update,
    Delete
}

export enum MWSPersistentStoreError {
    NoStoreURL,
    InvalidRequest
}

export class MWSPersistentStore extends MIOIncrementalStore {
    static get type(): string { return "MWSPersistentStore"; }
    get type(): string { return MWSPersistentStore.type; }

    delegate = null;

    private storeURL: MIOURL = null;    
    private nodesByReferenceID = {};  
    
    public useSaveBlocks = false;

    loadMetadata(): MIOError {

        if (this.url == null) throw new Error("MWSPersistentStoreError.NoStoreURL");
        this.storeURL = this.url;

        let uuid = MIOUUID.UUID().UUIDString;
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
            throw new Error("MWSPersistentStoreError.InvalidRequest");
        }
    }    

    newValuesForObjectWithID(objectID: MIOManagedObjectID, context: MIOManagedObjectContext): MIOIncrementalStoreNode {

        let serverID = this.referenceObjectForObjectID(objectID);
        //let referenceID = objectID.entity.name + "://" + serverID;
        if (serverID == null) throw new Error("MWSPersistentStore: Asking objectID without reference object");

        let node = this.nodeWithServerID(serverID, objectID.entity);
        if (node == null) return null;

        if (node.version == 0){
            this.fetchObjectWithServerID(serverID, objectID.entity.name, context);            
        }

        return node;
    }

    newValueForRelationship(relationship: MIORelationshipDescription, objectID: MIOManagedObjectID, context?: MIOManagedObjectContext) {

        let serverID = this.referenceObjectForObjectID(objectID);
        let referenceID = objectID.entity.name + "://" + serverID;

        if (referenceID == null) throw new Error("MWSPersistentStore: Asking objectID without referenceID");

        let node = this.nodesByReferenceID[referenceID] as MIOIncrementalStoreNode;    
        if (node == null) return;    
        
        if (relationship.isToMany == false) {

            let relRefID = node.valueForPropertyDescription(relationship);
            if (relRefID == null) return null;
            
            let relNode = this.nodeWithServerID(relRefID, relationship.destinationEntity);
            if (relNode == null) {
                relNode = this.newNodeWithValuesAtServerID(relRefID, {"identifier":relRefID}, 0, relationship.destinationEntity);
                //this.fetchObjectWithReferenceID(relRefID, relationship.destinationEntityName, context);
                //MIOLog("Downloading REFID: " + relRefID);
            }            
            return relNode.objectID;
        }
        else {                        
            let values = node.valueForPropertyDescription(relationship);
            if (values == null) return null;        

            let relRefIDs = values[2] || [];

            let array = [];
            for (let count = 0; count < relRefIDs.length; count++) {

                let relRefID = relRefIDs[count];
                let relNode = this.nodeWithServerID(relRefID, relationship.destinationEntity);
                if (relNode == null) {                    
                    relNode = this.newNodeWithValuesAtServerID(relRefID, {"identifier": relRefID}, 0, relationship.destinationEntity);
                    //this.fetchObjectWithReferenceID(relRefID, relationship.destinationEntityName, context);
                    //MIOLog("Downloading REFID: " + relRefID);
                }
                array.push(relNode.objectID);
            }
            return array;
        }

    }

    obtainPermanentIDsForObjects(objects){
        let array = [];

        for (let index = 0; index < objects.length; index++){
            let obj:MIOManagedObject = objects[index];
            let serverID = this.delegate.serverIDForObject(this, obj);
            let objID = this.newObjectIDForEntity(obj.entity, serverID);
            array.addObject(objID);
        }
        
        return array;
    }

    managedObjectContextDidRegisterObjectsWithIDs(objectIDs){
    }

    managedObjectContextDidUnregisterObjectsWithIDs(objectIDs:MIOManagedObjectID[]){
        for (let index = 0; index < objectIDs.length; index++){
            let objID = objectIDs[index];
            let serverID = this.referenceObjectForObjectID(objID);
            // if (referenceID == null) throw new Error("MWSPersistentStore: Asking objectID without referenceID");
            // let referenceID = objID.entity.name + "://" + serverID;
            // delete this.nodesByReferenceID[referenceID];            
            
            this.deleteNodeAtServerID(serverID, objID.entity);            
        }        

    }
            
    _fetchObjectWithObjectID(objectID:MIOManagedObjectID, context:MIOManagedObjectContext){        
        let serverID = objectID._getReferenceObject();
        let entityName = objectID.entity.name;        
        this.fetchObjectWithServerID(serverID, entityName, context);
    }

    private fetchingObjects = {};
    private fetchObjectWithServerID(serverID: string, entityName: string, context: MIOManagedObjectContext) {

        if (this.delegate == null) return;

        if (this.fetchingObjects[serverID] != null) return;
        
        this.fetchingObjects[serverID] = true;
        MIOLog("Downloading REFID: " + serverID);

        let fetchRequest = MIOFetchRequest.fetchRequestWithEntityName(entityName);
        fetchRequest.entity = MIOEntityDescription.entityForNameInManagedObjectContext(entityName, context);

        let request = this.delegate.fetchRequestForWebStore(this, fetchRequest, serverID);
        if (request == null) return;

        MIONotificationCenter.defaultCenter().postNotification(MWSPersistentStoreDidChangeEntityStatus, entityName, {"Status" : MWSPersistentStoreFetchStatus.Downloading});

        request.execute(this, function (code, data) {
            let [result, values] = this.delegate.requestDidFinishForWebStore(this, fetchRequest, code, data);
            
            MIOLog("Downloaded REFID: " + serverID);
            delete this.fetchingObjects[serverID];
            
            if (result === true && values.length > 0) {
                this.updateObjectInContext(values[0], fetchRequest.entity, context);                
            }
            MIONotificationCenter.defaultCenter().postNotification(MWSPersistentStoreDidChangeEntityStatus, entityName, {"Status" : MWSPersistentStoreFetchStatus.Downloaded});
        });
    }

    fetchObjects(fetchRequest: MIOFetchRequest, context: MIOManagedObjectContext, target?, completion?) {

        if (fetchRequest.entity == null) {
            fetchRequest.entity = MIOEntityDescription.entityForNameInManagedObjectContext(fetchRequest.entityName, context);
        }

        let entityName = fetchRequest.entity.name;

        if (this.delegate == null) return [];

        let request = this.delegate.fetchRequestForWebStore(this, fetchRequest, null);
        if (request == null) return [];

        MIONotificationCenter.defaultCenter().postNotification(MWSPersistentStoreDidChangeEntityStatus, entityName, {"Status" : MWSPersistentStoreFetchStatus.Downloading});

        let objects = [];

        request.execute(this, function (code, data) {
            if (code != 200) {
                if (target != null && completion != null){
                    completion.call(target, [], "ERROR");
                }
                return;
            }

            let [result, items] = this.delegate.requestDidFinishForWebStore(this, fetchRequest, code, data);
            if (result == true) {                
                let relationships = fetchRequest.relationshipKeyPathsForPrefetching;
                objects = this.updateObjectsInContext(items, fetchRequest.entity, context, relationships);
            }
            MIONotificationCenter.defaultCenter().postNotification(MWSPersistentStoreDidChangeEntityStatus, entityName, {"Status" : MWSPersistentStoreFetchStatus.Downloaded});            

            if (target != null && completion != null){
                completion.call(target, objects, null);
            }
        });

        return [];
    }

    private relationShipsNodes(relationships, nodes){

        for (let index = 0; index < relationships.length; index++){
            let keyPath = relationships[index];
            
            let keys = keyPath.split('.');
            let key = keys[0];

            let values = nodes[key];
            if (values == null) {
                values = {};
                nodes[key] = values;
            }

            if (keys.length > 1){
                let subKeyPath = keyPath.substring(key.length + 1);
                this.relationShipsNodes([subKeyPath], values); 
            }                                    
        }
    }

    updateObjectsInContext(items, entity: MIOEntityDescription, context: MIOManagedObjectContext, relationships) {

        if (context == null) return;
        if (items == null) return;

        let objects = [];
        let relationShipNodes = {};
        this.relationShipsNodes(relationships, relationShipNodes);
        

        context.performBlockAndWait(this, function () {

            for (var index = 0; index < items.length; index++) {

                let objectValues = items[index];
                let obj = this.updateObjectInContext(objectValues, entity, context, null, relationShipNodes);
                                        
                objects.addObject(obj);
            }
        });

        return objects;
    }

    isEntityParentOf(entity:MIOEntityDescription, parent:MIOEntityDescription):boolean {
        if (entity.superentity == null) return false;
        if (entity.superentity.name == parent.name) return true;

        return this.isEntityParentOf(entity.superentity, parent);
    }

    private updateObjectInContext(values, entity: MIOEntityDescription, context: MIOManagedObjectContext, objectID?:MIOManagedObjectID, relationshipNodes?) {

        // Check the objects inside values  
        if (values.length == 0) return;
              
        let objectEntity = entity;
        let entityName = values["classname"] || entity.name;
        if (entity.name != entityName) {
            objectEntity = MIOEntityDescription.entityForNameInManagedObjectContext(entityName, context);
        }

        let parsedValues = this.checkRelationships(values, objectEntity, context, relationshipNodes);

        let serverID = this.delegate.serverIDForItem(this, parsedValues, objectEntity.name);
        if (serverID == null) {
            throw new Error("MWSPersistentStore: SERVER ID CAN NOT BE NULL. (" + objectEntity.name + ")");
        }
        
        let version = this.delegate.serverVersionNumberForItem(this, parsedValues, objectEntity.name);        

        let refresh = false;
        let node:MIOIncrementalStoreNode = this.nodeWithServerID(serverID, objectEntity);
        if (node == null) {
            MIOLog("New version: " + entityName + " (" + version + ")");
            node = this.newNodeWithValuesAtServerID(serverID, parsedValues, version, objectEntity, objectID);
            refresh = true;
        }
        else if (version > node.version){
            MIOLog("Update version: " + objectEntity.name + " (" + node.version + " -> " + version + ")");   
            if (this.isEntityParentOf(objectEntity, node.objectID.entity)) {
                node = this.newNodeWithValuesAtServerID(serverID, parsedValues, version, objectEntity, objectID);
            }
            else {
                this.updateNodeWithValuesAtServerID(serverID, parsedValues, version, objectEntity);
            }
            refresh = true;
        } 

        let obj = context.existingObjectWithID(node.objectID);
        if (refresh == true) {            
            if (obj != null) context.refreshObject(obj, true);                            
        }

        return obj;
    }

    private nodeWithServerID(serverID:string, entity:MIOEntityDescription){    
        if (entity.isAbstract == true) return null;

        let referenceID = entity.name + "://" + serverID;
        let node = this.nodesByReferenceID[referenceID];

        if (node != null) return node;
        if (entity.superentity == null) return null;                        
        return this.nodeWithServerID(serverID, entity.superentity);
    }

    private newNodeWithValuesAtServerID(serverID:string, values, version, entity:MIOEntityDescription, objectID?:MIOManagedObjectID){        
        let referenceID = entity.name + "://" + serverID;

        let objID = objectID != null ? objectID : this.newObjectIDForEntity(entity, serverID);

        let node = new MIOIncrementalStoreNode();
        node.initWithObjectID(objID, {}, version);
        this.nodesByReferenceID[referenceID] = node;
        let parsedValues = this.updateNodeWithValuesAtServerID(serverID, values, version, entity);
        MIOLog("Inserting REFID: " + referenceID);
                
        if (entity.superentity != null) {            
            this._newNodeWithValuesAtServerID(serverID, parsedValues, version, entity.superentity, objID);
        }

        return node;
    }

    private _newNodeWithValuesAtServerID(serverID:string, values, version, entity:MIOEntityDescription, objectID:MIOManagedObjectID) {
        if (entity.isAbstract == true) return null;

        let referenceID = entity.name + "://" + serverID;
        
        let node = new MIOIncrementalStoreNode();
        node.initWithObjectID(objectID, values, version);
        this.nodesByReferenceID[referenceID] = node;    
        MIOLog("Inserting REFID: " + referenceID);    

        if (entity.superentity != null) {
            this._newNodeWithValuesAtServerID(serverID, values, version, entity.superentity, objectID);
        }
    }

    private isSuperEntity(fromEntity:MIOEntityDescription, toEntity:MIOEntityDescription) : boolean {
        if (fromEntity.name == toEntity.name) return false;

        let e = fromEntity.superentity;
        while (e != null) {
            if (e.name == toEntity.name) return true;
            e = e.superentity;
        }

        return false;

    }

    private updateNodeWithValuesAtServerID(serverID:string, values:any, version:number, entity:MIOEntityDescription){                
        let node = this.nodeWithServerID(serverID, entity);

        // if (this.isSuperEntity(entity, node.objectID.entity)) {
        //     this.deleteNodeAtServerID(serverID, node.objectID.entity);
        //     node = this.newNodeWithValuesAtServerID(serverID, values, version, entity);
        // } else
        if (node.objectID.entity.name != entity.name) {
            node = this.nodesByReferenceID[node.objectID.entity.name + "://" + node.objectID._getReferenceObject()];
        }
        
        if (this.useSaveBlocks) {
            for (let key in entity.relationshipsByName) {
                let rel = entity.relationshipsByName[key] as MIORelationshipDescription;
                if (rel.isToMany == false) continue;
                let syncValues = values[key];
                if (syncValues == null) continue;

                if (syncValues.length === 0) {
                     values[key] = null;
                     continue ;
                }

                // CASE: syncValues is [string] OR [string[],string[],string[]]
                // It comes from "server"
                if (!Array.isArray(syncValues[ 0 ])) {
                     values[key] = [[], [], syncValues] ;
                     continue ;
                }

                let addValues = syncValues[0];
                let removeValues = syncValues[1];

                const cachedValues = node.valueForPropertyDescription(rel);
                if (cachedValues == null) {
                    values[key] = [addValues, [], addValues];
                } else {                
                    let new_values = cachedValues[2];
                    for (let v of addValues) {new_values.addObject(v)}
                    for (let v of removeValues) {new_values.removeObject(v)}
                    cachedValues[2] = new_values;
                    values[key] = cachedValues;
                }
            }
        }
        
        node.updateWithValues(values, version);
        MIOLog("Updating REFID: " + entity.name + "://" + serverID);        
        return values;
    }

    // private _updateWithValues(serverID:string, values, version, entity:MIOEntityDescription) {
    //     let referenceID = entity.name + "://" + serverID;
    //     let node = this.nodesByReferenceID[referenceID] as MIOIncrementalStoreNode;
    //     node.updateWithValues(values, version);
    //     MIOLog("Updating REFID: " + referenceID);
    // }

    private deleteNodeAtServerID(serverID:string, entity:MIOEntityDescription){
        let referenceID = entity.name + "://" + serverID;
        delete this.nodesByReferenceID[referenceID];
        MIOLog("Deleting REFID: " + referenceID);   
        
        if (entity.superentity != null) 
            this.deleteNodeAtServerID(serverID, entity.superentity);
    }    

    private partialRelationshipObjects = {};
    private checkRelationships(values, entity:MIOEntityDescription, context:MIOManagedObjectContext, relationshipNodes?){                                

        let parsedValues = values;
        if (relationshipNodes == null) return parsedValues;

        for (let key in relationshipNodes){                                    
            let relEntity = entity.relationshipsByName[key];
            if (relEntity == null) continue;
            
            let serverRelName = this.delegate.serverRelationshipName(this, relEntity.name, entity);
            let value = values[serverRelName];

            if (value == null) continue;

            if (relEntity.isToMany == false) {
                if (typeof value === "string") {
                    // Means you get and UUID of a deleted entity
                    parsedValues[serverRelName] = null;
                }
                else {
                    let relKeyPathNode = relationshipNodes[key]; 
                    this.updateObjectInContext(value, relEntity.destinationEntity, context, null, relKeyPathNode);
                    let serverID = this.delegate.serverIDForItem(this, value, relEntity.destinationEntity.name);                                
                    parsedValues[serverRelName] = serverID;
                }
            }
            else {                
                let array = [];
                let relKeyPathNode = relationshipNodes[key]; 
                for (let count = 0; count < value.length; count++){
                    let serverValues = value[count];
                    this.updateObjectInContext(serverValues, relEntity.destinationEntity, context, null, relKeyPathNode);
                    let serverID = this.delegate.serverIDForItem(this, serverValues, relEntity.destinationEntityName);                
                    array.addObject(serverID);
                }
                parsedValues[serverRelName] = array;
            }
        }

        return parsedValues;
    }    

    //
    // Track save operation
    //

    private saveTarget = null;
    private saveCompletion = null;
    performBlockWithCompletion(target, block, completion){
        this.saveOperations = 0;
        this.saveTarget = target;
        this.saveCompletion = completion;
        block.call(this);
        if (this.saveCompletion == null || this.saveTarget == null) return;
        if (this.saveOperations === 0) {
            this.saveCompletion.call(this.saveTarget);
            this.saveTarget = null;
            this.saveCompletion = null;
        }
    }

    private saveOperations = 0;
    private saveOperationDidAdd(op:MWSPersistenStoreOperation){
        if (this.saveTarget == null || this.saveCompletion == null) return;
        this.saveOperations++;
    }

    private saveOperationDidRemove(op:MWSPersistenStoreOperation){
        if (this.saveTarget == null || this.saveCompletion == null) return;
        this.saveOperations--;

        if (this.saveOperations == 0) {
            this.saveCompletion.call(this.saveTarget);
            this.saveTarget = null;
            this.saveCompletion = null;
        }
    }

    private saveCount = 0;
    private saveObjects(request: MIOSaveChangesRequest, context?: MIOManagedObjectContext) {

        if (context == null) return;

        if (this.useSaveBlocks == true && typeof this.delegate.saveRequestForWebStore === "function") {            
            this.saveObjectsOnServer(request.insertedObjects, request.updatedObjects, request.deletedObjects);
            return;
        }

        let inserts = request.insertedObjects;
        for (let index = 0; index < inserts.count; index++) {
            let obj = inserts.objectAtIndex(index) as MIOManagedObject;                
            this.insertObjectToServer(obj);            
        }

        let updates = request.updatedObjects;
        for (let index = 0; index < updates.count; index++) {
            let obj = updates.objectAtIndex(index) as MIOManagedObject;                
            this.updateObjectOnServer(obj);            
        }

        let deletes = request.deletedObjects;
        for (let index = 0; index < deletes.count; index++) {
            let obj = deletes.objectAtIndex(index) as MIOManagedObject;                
            this.deleteObjectOnServer(obj);            
        }

        this.uploadToServer();
        this.saveCount++;
    }

    // private cloneValues(values:any) {
    //     let new_values = {};
    //     for (let key in values) {
    //         let v = values[key];
    //         if (v instanceof Array) {
    //             let array = [];
    //             for (let index = 0; index < v.length; index++){
    //                 let item = v[index];
    //                 if (item instanceof Object) array.push(item["identifier"]);
    //                 else array.push(item);
    //             }
    //         }
    //         else if (v instanceof Object) {
    //             new_values[key] = v["identifier"];
    //         }
    //         else new_values[key] = v;
    //     }

    //     return new_values;    
    // }



    saveObjectsOnServer(insertedObjects: MIOManagedObjectSet, updatedObjects: MIOManagedObjectSet, deletedObjects: MIOManagedObjectSet){
        
        const items = [];

        for (let index = 0; index < insertedObjects.count; index++) {
            let obj = insertedObjects.objectAtIndex(index);
            const values = this.delegate.serverValuesForObject(this, obj, true, "INSERT");
            const serverID = this.delegate.serverIDForObject(this, obj);
            this.newNodeWithValuesAtServerID(serverID, MIOCoreObjectClone(values["values"]), 1, obj.entity, obj.objectID);
            if (this.delegate.canSynchronizeEntity(this, obj.entity, "INSERT")) items.push(values);
        }

        for (let index = 0; index < updatedObjects.count; index++) {
            let obj = updatedObjects.objectAtIndex(index) as MIOManagedObject;
            const values = this.delegate.serverValuesForObject(this, obj, true, "UPDATE");
            const serverID = this.delegate.serverIDForObject(this, obj);
            let node = this.nodeWithServerID(obj.objectID._getReferenceObject(), obj.entity);
            let version = node.version + 1;
            this.updateNodeWithValuesAtServerID(serverID, MIOCoreObjectClone(values["values"]), version, obj.entity);
            if (this.delegate.canSynchronizeEntity(this, obj.entity, "UPDATE")) items.push(values);
        }

        for (let index = 0; index < deletedObjects.count; index++) {
            let obj = deletedObjects.objectAtIndex(index);
            const values = this.delegate.serverValuesForObject(this, obj, true, "DELETE");
            const serverID = this.delegate.serverIDForObject(this, obj);
            this.deleteNodeAtServerID(serverID, obj.entity);
            if (this.delegate.canSynchronizeEntity(this, obj.entity, "DELETE")) items.push(values);
        }

        if (items.length == 0) return;
        
        const request = this.delegate.saveRequestForWebStore(this, items);
        if (request == null) return;
        request.type = MWSRequestType.Save;

        this.addSaveBlockRequest(request);

        // let op = new MWSPersistenStoreOperation();
        // op.initWithDelegate(this);
        // op.request = request;        
        // op.saveCount = this.saveCount;

        // MIOLog("OPERATION: Will save");

        // op.target = this;
        // op.completion = function () {
        //     MIOLog("OPERATION: Did save");
        //     //this.removeOperation(op, serverID);
        //     //this.removeUploadingOperationForServerID(serverID);

        //     // let [result, serverValues] = this.delegate.requestDidFinishForWebStore(this, null, op.responseCode, op.responseJSON);
        //     // let version = this.delegate.serverVersionNumberForItem(this, serverValues);
        //     // MIOLog("Object " + serverID + " -> Insert " + (result ? "OK" : "FAIL") + " (" + version + ")");                     
        //     // if (version > 1) this.updateObjectInContext(serverValues, object.entity, object.managedObjectContext, object.objectID);
            
        //     this.saveOperationDidRemove(op);            
        // }  
        
        // this.saveOperationQueue.addOperation(op);
        // this.saveOperationDidAdd(op);

        //this.uploadToServer();
    }    

    private saveBlockOperationCount = 0;
    addSaveBlockRequest(request:MWSRequest) {
        // this.saveBlockQueue.addObject(request);
        MWSCache.sharedInstance().save(request, ()=> { 
            this.checkSaveBlockRequests(request.schema);
        });
    }

    private checkSaveBlockRequests(schema:string) {
        // check first if we have something pending to upload
        MWSCache.sharedInstance().fetch(schema, (items:any[]) => {
            if (items.length == 0) return;

            let data = items[0];

            let r = new MWSJSONRequest();
            let url = MIOURL.urlWithString(data["url"]);//.replace("http://localhost:8090/","https://test.dual-link.com/"));
            r.initWithURL(url, data["body"], data["method"]);
            r.headers = data["headers"];
            r.transaction = data["transaction"];
            r.schema = data["schema"];

            if (items.length > 0) this.executeSaveRequestOperation(r);
        });      
    };

    executeSaveRequestOperation(request:MWSRequest) {
        if (this.saveBlockOperationCount > 0) return;
        // if (this.saveBlockQueue.length == 0) return;

        this.saveBlockOperationCount++;
        // const request = this.saveBlockQueue.firstObject();

        let op = new MWSPersistenStoreOperation();
        op.initWithDelegate(this);
        op.request = request;        
        op.saveCount = this.saveCount;

        MIOLog("OPERATION: Will save");

        op.target = this;
        op.completion = function () {
            MIOLog("OPERATION: Did save");            
            // let [result, serverValues] = this.delegate.requestDidFinishForWebStore(this, null, op.responseCode, op.responseJSON);
            this.saveOperationDidRemove(op);
            this.saveBlockOperationCount--;
            if (op.responseCode == 200) {
                // this.saveBlockQueue.removeObjectAtIndex(0);
                MWSCache.sharedInstance().delete(request.schema, request.transaction, (status:boolean) => {
                    if (status == true) this.checkSaveBlockRequests(request.schema);
                });                
            }
            else {
                MIONotificationCenter.defaultCenter().postNotification(MWSPersistentStoreSaveOperationError, op.request!.transaction);
            }
        }  
        
        this.saveOperationQueue.addOperation(op);
        this.saveOperationDidAdd(op);        
    }    

    insertObjectToServer(object: MIOManagedObject) {

        if (this.delegate == null) return;

        let entityName = object.entity.name;
        
        let serverID = this.delegate.serverIDForObject(this, object);
        // We need to create an empty node before we call server Values for object,
        // because inside we call valueForKey that needs the a node.
        this.newNodeWithValuesAtServerID(serverID, {}, 0, object.entity, object.objectID);
        
        // We update the node with the values
        let values = this.delegate.serverValuesForObject(this, object, true);
        this.updateNodeWithValuesAtServerID(serverID, values, 1, object.entity);
        
        let dependencyIDs = [];

        let request = this.delegate.insertRequestForWebStore(this, object, dependencyIDs);
        if (request == null) return;
        request.type = MWSRequestType.Save;

        let op = new MWSPersistenStoreOperation();
        op.initWithDelegate(this);
        op.request = request;
        op.dependencyIDs = dependencyIDs;
        op.saveCount = this.saveCount;
        this.addOperation(op, serverID);        
        this.saveOperationDidAdd(op);            

        MIOLog("OPERATION: Insert " + object.entity.name + " -> " + serverID + ":" + this.saveCount);

        op.target = this;
        op.completion = function () {
            MIOLog("OPERATION: Insert " + object.entity.name + " -> " + serverID + ":" + op.saveCount + " (OK)");
            if (typeof this.delegate.insertRequestDidFinishForWebStore === "function") this.delegate.insertRequestDidFinishForWebStore(object);
            //this.removeOperation(op, serverID);
            this.removeUploadingOperationForServerID(serverID);

            let [result, serverValues] = this.delegate.requestDidFinishForWebStore(this, null, op.responseCode, op.responseJSON);
            let version = this.delegate.serverVersionNumberForItem(this, serverValues);
            MIOLog("Object " + serverID + " -> Insert " + (result ? "OK" : "FAIL") + " (" + version + ")");                     
            if (version > 1) this.updateObjectInContext(serverValues, object.entity, object.managedObjectContext, object.objectID);
            
            this.saveOperationDidRemove(op);            
        }  
    }

    private updateObjectOnServer(object: MIOManagedObject) {

        if (this.delegate == null) return;

        let entityName = object.entity.name;
        
        let serverID = this.delegate.serverIDForObject(this, object);
        let values = this.delegate.serverValuesForObject(this, object, true);
        
        let node = this.nodeWithServerID(serverID, object.entity);
        if (node == null) {
            MIONotificationCenter.defaultCenter().postNotification("MWSPersistentStoreError", this, {"error":"Updating object but was never cached"});
            throw Error("MWSPersistentError:Updating object but was never cached!");
        }
        this.updateNodeWithValuesAtServerID(serverID, values, node.version + 1, object.entity);
        
        let dependencyIDs = [];

        let request = this.delegate.updateRequestForWebStore(this, object, dependencyIDs);
        if (request == null) return;
        request.type = MWSRequestType.Save;

        let op = new MWSPersistenStoreOperation();
        op.initWithDelegate(this);
        op.request = request;
        op.dependencyIDs = dependencyIDs;
        op.saveCount = this.saveCount;
        this.addOperation(op, serverID); 
        this.saveOperationDidAdd(op);                   

        MIOLog("OPERATION: Update " + object.entity.name + " -> " + serverID + ":" + this.saveCount);

        op.target = this;
        op.completion = function () {
            MIOLog("OPERATION: Update " + object.entity.name + " -> " + serverID + ":" + op.saveCount + " (OK)");
            if (typeof this.delegate.updateRequestDidFinishForWebStore === "function") this.delegate.updateRequestDidFinishForWebStore(object);
            //this.removeOperation(op, serverID);
            this.removeUploadingOperationForServerID(serverID);            

            let [result, serverValues] = this.delegate.requestDidFinishForWebStore(this, null, op.responseCode, op.responseJSON);
            let version = this.delegate.serverVersionNumberForItem(this, serverValues);            
            MIOLog("Object " + serverID + " -> Update " + (result ? "OK" : "FAIL") + " (" + version + ")");
            if (version > node.version) {
                this.updateObjectInContext(serverValues, object.entity, object.managedObjectContext, object.objectID);                
            }
            
            this.saveOperationDidRemove(op);
            MIONotificationCenter.defaultCenter().postNotification(MWSPersistentStoreDidUpdateEntity, object, serverID);            
        }        
    }

    deleteObjectOnServer(object: MIOManagedObject) {

        if (this.delegate == null) return;

        let entityName = object.entity.name;
        
        let serverID = this.delegate.serverIDForObject(this, object);
        //let node = this.nodeWithServerID(serverID, object.entity);
        this.deleteNodeAtServerID(serverID, object.entity);
        
        let request = this.delegate.deleteRequestForWebStore(this, object);
        if (request == null) return;
        request.type = MWSRequestType.Save;

        let op = new MWSPersistenStoreOperation();
        op.initWithDelegate(this);
        op.request = request;
        op.dependencyIDs = [];
        op.saveCount = this.saveCount;
        this.addOperation(op, serverID);   
        this.saveOperationDidAdd(op);                 

        MIOLog("OPERATION: Delete " + object.entity.name + " -> " + serverID);

        op.target = this;
        op.completion = function () {
            MIOLog("OPERATION: Delete " + object.entity.name + " -> " + serverID + "(OK)");
            if (typeof this.delegate.deleteRequestDidFinishForWebStore === "function") this.delegate.deleteRequestDidFinishForWebStore(object);
            //this.removeOperation(op, serverID);
            this.removeUploadingOperationForServerID(serverID);            

            let [result] = this.delegate.requestDidFinishForWebStore(this, null, op.responseCode, op.responseJSON);
            //let version = this.delegate.serverVersionNumberForItem(this, values);
            MIOLog("Object " + serverID + " -> Deleted " + (result ? "OK" : "FAIL"));                     
            this.saveOperationDidRemove(op);
        }  
    }

    //
    // App to server comunication
    //

    private addOperation(operation:MWSPersistenStoreOperation, serverID:string){
        //let opRef = serverID + "/" + operation.saveCount;
        //this.saveOperationsByReferenceID[opRef] = operation;
        this.saveOperationsByReferenceID[serverID] = operation;
    }

    private removeOperation(operation:MWSPersistenStoreOperation, serverID:string){
        //let opRef = serverID + "/" + operation.saveCount;
        //delete this.saveOperationsByReferenceID[opRef];
        delete this.saveOperationsByReferenceID[serverID];
    }

    operationAtServerID(serverID:string, saveCount){
        // let opRef = serverID + "/" + saveCount;
        // return this.saveOperationsByReferenceID[opRef];
        return this.saveOperationsByReferenceID[serverID];
    }

    private fetchOperationQueue:MIOOperationQueue = null;
    private fetchFromServer(){
        if (this.fetchOperationQueue == null) {
            this.fetchOperationQueue = new MIOOperationQueue();
            this.fetchOperationQueue.init();
        }        
    }

    private _saveOperationQueue:MIOOperationQueue = null;
    private get saveOperationQueue(): MIOOperationQueue {
        if (this._saveOperationQueue == null) {
            this._saveOperationQueue = new MIOOperationQueue();
            this.saveOperationQueue.init();
            this.saveOperationQueue.maxConcurrentOperationCount = 1;
        }
        
        return this._saveOperationQueue;
    }

    private saveOperationsByReferenceID = {};
    private uploadingOperations = {};

    private checkOperationDependecies(operation: MWSPersistenStoreOperation, dependencies) {

        for (let index = 0; index < dependencies.length; index++) {
            let referenceID = dependencies[index];
            let op = this.operationAtServerID(referenceID, this.saveCount);
            if (op == null) {
                op = this.lastUploadingOperationByServerID(referenceID);
            }
            if (op == null) continue;
            operation.addDependency(op);
        }
    }
    
    private uploadToServer() {

        for (let refID in this.saveOperationsByReferenceID) {
            let op = this.saveOperationsByReferenceID[refID];
            this.checkOperationDependecies(op, op.dependencyIDs);
            this.addUploadingOperation(op, refID);            
            this.saveOperationQueue.addOperation(op);           
        }

        this.saveOperationsByReferenceID = {};
    }

    private addUploadingOperation(op:MWSPersistenStoreOperation, serverID){
        
        let array = this.uploadingOperations[serverID];
        if (array == null){
            array = [];
            this.uploadingOperations[serverID] = array;
        }
        else {
            let lastOP = array.lastObject();
            op.addDependency(lastOP);       
        }

        array.push(op);        
    }

    private lastUploadingOperationByServerID(serverID:string){
        let array = this.uploadingOperations[serverID];
        if (array == null) return null;
        if (array.count == 0) return null;
        return array.lastObject();
    }

    private removeUploadingOperationForServerID(serverID:string){
        let array = this.uploadingOperations[serverID];
        if (array == null) return;
        if (array.count == 0) return;
        array.removeObjectAtIndex(0);
        if (array.count == 0) delete this.uploadingOperations[serverID];
    }   
    
    deleteTransaction(schema:string, transaction:string, completion:any){
        MWSCache.sharedInstance().delete(schema, transaction, () => {
            this.checkSaveBlockRequests(schema);
            completion();
        });    
    }

    checkTransactions(schema:string, completion:any){
        this.checkSaveBlockRequests(schema);
    }

}