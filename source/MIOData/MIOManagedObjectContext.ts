import { MIOObject, MIOSet, MIONotificationCenter, _MIOPredicateFilterObjects, MIONotification } from "../MIOFoundation";
import { MIOManagedObjectID } from "./MIOManagedObjectID";
import { MIOClassFromString } from "../MIOCore/platform";
import { _MIOSortDescriptorSortObjects } from "../MIOFoundation/MIOSortDescriptor";
import { MIOManagedObject } from "./MIOManagedObject";
import { MIOIncrementalStore } from "./MIOIncrementalStore";
import { MIOIncrementalStoreNode } from "./MIOIncrementalStoreNode";
import { MIOEntityDescription } from "./MIOEntityDescription";
import { MIOFetchRequest } from "./MIOFetchRequest";
import { MIOPersistentStoreCoordinator } from "./MIOPersistentStoreCoordinator";
import { MIOPersistentStore } from "./MIOPersistentStore";
import { MIOSaveChangesRequest } from "./MIOSaveChangesRequest";

/**
 * Created by godshadow on 12/4/16.
 */

export let MIOManagedObjectContextWillSaveNotification = "MIOManagedObjectContextWillSaveNotification";
export let MIOManagedObjectContextDidSaveNotification = "MIOManagedObjectContextDidSaveNotification";
export let MIOManagedObjectContextObjectsDidChange = "MIOManagedObjectContextObjectsDidChange";

export let MIOInsertedObjectsKey = "MIOInsertedObjectsKey";
export let MIOUpdatedObjectsKey = "MIOUpdatedObjectsKey";
export let MIODeletedObjectsKey = "MIODeletedObjectsKey";
export let MIORefreshedObjectsKey = "MIORefreshedObjectsKey";

export enum MIOManagedObjectContextConcurrencyType {
    PrivateQueue,
    MainQueue
}

export enum NSMergePolicy {
    None
}

export class MIOManagedObjectContext extends MIOObject {
    persistentStoreCoordinator: MIOPersistentStoreCoordinator = null;

    concurrencyType = MIOManagedObjectContextConcurrencyType.MainQueue;
    mergePolicy = "";

    private _parent: MIOManagedObjectContext = null;

    // private managedObjectChanges = {};

    private objectsByEntity = {};
    private objectsByID = {};

    private insertedObjects: MIOSet = MIOSet.set();
    private updatedObjects: MIOSet = MIOSet.set();
    private deletedObjects: MIOSet = MIOSet.set();

    private blockChanges = null;

    initWithConcurrencyType(type: MIOManagedObjectContextConcurrencyType) {
        super.init();
        this.concurrencyType = type;
    }

    set parent(value: MIOManagedObjectContext) {
        this._parent = value;
        if (value != null) {
            this.persistentStoreCoordinator = value.persistentStoreCoordinator;
        }
    }
    get parent() { return this._parent; }

    
    private registerObjects = [];
    private _registerObject(object: MIOManagedObject) {

        if (this.objectsByID[object.objectID.URIRepresentation.absoluteString] != null) return;

        this.registerObjects.addObject(object);
        this.objectsByID[object.objectID.URIRepresentation.absoluteString] = object;

        // let entityName = object.entity.name;
        // let array = this.objectsByEntity[entityName];
        // if (array == null) {
        //     array = [];
        //     this.objectsByEntity[entityName] = array;
        // }
        // array.addObject(object);

        this._registerObjectForEntity(object, object.entity);

        if (object.objectID.persistentStore instanceof MIOIncrementalStore){
            let is = object.objectID.persistentStore as MIOIncrementalStore;
            is.managedObjectContextDidRegisterObjectsWithIDs([object.objectID]);
        }        
    }

    private _registerObjectForEntity(object:MIOManagedObject, entity:MIOEntityDescription) {        
        let entityName = entity.name;
        let array = this.objectsByEntity[entityName];
        if (array == null) {
            array = [];
            this.objectsByEntity[entityName] = array;
        }
        array.addObject(object);
        
        if (entity.superentity != null) this._registerObjectForEntity(object, entity.superentity);
    }

    private _unregisterObject(object: MIOManagedObject) {
        this.registerObjects.removeObject(object);
        delete this.objectsByID[object.objectID.URIRepresentation.absoluteString];

        let entityName = object.entity.name;
        let array = this.objectsByEntity[entityName];
        if (array != null) {
            array.removeObject(object);
        }        

        if (object.objectID.persistentStore instanceof MIOIncrementalStore){
            let is = object.objectID.persistentStore as MIOIncrementalStore;
            is.managedObjectContextDidUnregisterObjectsWithIDs([object.objectID]);
        }        
        
    }

    insertObject(object: MIOManagedObject) {
        if (this.insertedObjects.containsObject(object)) return;

        let store = this.persistentStoreCoordinator._persistentStoreForObject(object);
        let objectID = object.objectID;

        objectID._setStoreIdentifier(store.identifier);
        objectID._setPersistentStore(store);

        if (this.updatedObjects.containsObject(object)) { this.updatedObjects.removeObject(object); }

        this.insertedObjects.addObject(object);
        this._registerObject(object);
        object._setIsInserted(true);
    }

    updateObject(object: MIOManagedObject) {
        if (this.updatedObjects.containsObject(object)) return;        
        if (this.insertedObjects.containsObject(object)) return;
        if (this.deletedObjects.containsObject(object)) return;
        this.updatedObjects.addObject(object);
        object._setIsUpdated(true);
    }

    deleteObject(object: MIOManagedObject) {
        if (this.deletedObjects.containsObject(object)) { return; }
        if (this.updatedObjects.containsObject(object)) { this.updatedObjects.removeObject(object); }
        
        this.insertedObjects.removeObject(object);
        object._setIsInserted(false);
        this.updatedObjects.removeObject(object);
        object._setIsUpdated(false);
        this.deletedObjects.addObject(object);
        object._setIsDeleted(true);
        //this._unregisterObject(object);
    }

    _objectWithURIRepresentationString(urlString:string){
        return this.objectsByID[urlString];
    }

    objectWithID(objectID: MIOManagedObjectID) {

        let obj:MIOManagedObject = this.objectsByID[objectID.URIRepresentation.absoluteString];
        if (obj == null) {
            obj = MIOClassFromString(objectID.entity.managedObjectClassName);
            obj._initWithObjectID(objectID, this);  
            this._registerObject(obj);               
        }
        return obj;
    }

    existingObjectWithID(objectID: MIOManagedObjectID): MIOManagedObject {

        let obj: MIOManagedObject = this.objectsByID[objectID.URIRepresentation.absoluteString];

        let store:MIOIncrementalStore = objectID.persistentStore as MIOIncrementalStore;
        let node:MIOIncrementalStoreNode = store._nodeForObjectID(objectID, this);

        if (obj != null && node != null){
            obj._setIsFault(true);
        }
        else if (obj == null && node != null){
            obj = MIOClassFromString(objectID.entity.managedObjectClassName);
            obj._initWithObjectID(objectID, this);
            this._registerObject(obj);
        }

        return obj;
    }

    refreshObject(object: MIOManagedObject, mergeChanges: boolean) {

        if (mergeChanges == false) return;

        if (object.isFault == false) return;

        let changes = null;
        if (this.blockChanges != null) {
            changes = this.blockChanges;
        }
        else {
            changes = {};
            changes[MIORefreshedObjectsKey] = {};
        }

        let entityName = object.entity.name;
        let objs = changes[MIORefreshedObjectsKey];

        let set = objs[entityName];
        if (set == null) {
            set = MIOSet.set();
            objs[entityName] = set;
        }

        set.addObject(object);

        if (this.blockChanges == null) {
            //this.persistentStoreCoordinator.updateObjectWithObjectID(object.objectID, this); 
            //object.isFault = false;           
            MIONotificationCenter.defaultCenter().postNotification(MIOManagedObjectContextObjectsDidChange, this, changes);
        }
    }

    private addObjectToTracking(objectTracking, object: MIOManagedObject) {
        let array = objectTracking[object.entity.name];
        if (array == null) {
            array = [];
            objectTracking[object.entity.name] = array;
        }
        array.push(object);
    }

    private removeObjectFromTracking(objectTracking, object: MIOManagedObject) {
        let array = objectTracking[object.entity.name];
        if (array == null) return;
        let index = array.indexOf(object);
        if (index > -1) array.splice(index, 1);
    }

    removeAllObjectsForEntityName(entityName) {
        let objs = this.objectsByEntity[entityName];
        if (objs != null) {
            for (let index = objs.length - 1; index >= 0; index--) {
                let o = objs[index];
                this.deleteObject(o);
            }
        }
    }

    executeFetch(request) {

        let entityName = request.entityName;
        let entity = MIOEntityDescription.entityForNameInManagedObjectContext(entityName, this);
        request.entity = entity;

        //TODO: Get the store from configuration name
        let store: MIOPersistentStore = this.persistentStoreCoordinator.persistentStores[0];
        let objs = store._executeRequest(request, this);

        for (let index = 0; index < objs.length; index++) {
            let o = objs[index];
            this._registerObject(o);
        }

        if (request instanceof MIOFetchRequest) {
            let fetchRequest = request as MIOFetchRequest;
            let objects = _MIOPredicateFilterObjects(this.objectsByEntity[entityName], fetchRequest.predicate);
            objects = _MIOSortDescriptorSortObjects(objects, fetchRequest.sortDescriptors);
            return objects;
        }

        return [];
    }

    _obtainPermanentIDForObject(object: MIOManagedObject) {
        let store: MIOPersistentStore = object.objectID.persistentStore;
        let objID = store._obtainPermanentIDForObject(object);

        delete this.objectsByID[object.objectID.URIRepresentation.absoluteString];

        object.objectID._setReferenceObject(objID._getReferenceObject());

        this.objectsByID[object.objectID.URIRepresentation.absoluteString] = object;
    }

    save() {

        // Check if nothing changed... to avoid unnecessay methods calls
        if (this.insertedObjects.length == 0 && this.updatedObjects.length == 0 && this.deletedObjects.length == 0) return;

        // There's changes, so keep going...
        MIONotificationCenter.defaultCenter().postNotification(MIOManagedObjectContextWillSaveNotification, this);

        // Deleted objects
        let deletedObjectsByEntityName = {};
        for (let index = 0; index < this.deletedObjects.count; index++) {
            let delObj: MIOManagedObject = this.deletedObjects.objectAtIndex(index);

            // Track object for save notification
            let entityName = delObj.entity.name;
            let array = deletedObjectsByEntityName[entityName];
            if (array == null) {
                array = [];
                deletedObjectsByEntityName[entityName] = array;
            }
            array.addObject(delObj);
        }

        // Inserted objects
        let insertedObjectsByEntityName = {};
        for (let index = 0; index < this.insertedObjects.count; index++) {
            let insObj: MIOManagedObject = this.insertedObjects.objectAtIndex(index);

            this._obtainPermanentIDForObject(insObj);

            // Track object for save notification
            let entityName = insObj.entity.name;
            let array = insertedObjectsByEntityName[entityName];
            if (array == null) {
                array = [];
                insertedObjectsByEntityName[entityName] = array;
            }
            array.addObject(insObj);
        }

        // Updated objects
        let updatedObjectsByEntityName = {};
        for (let index = 0; index < this.updatedObjects.count; index++) {
            let updObj: MIOManagedObject = this.updatedObjects.objectAtIndex(index);

            // Track object for save notification
            let entityName = updObj.entity.name;
            let array = updatedObjectsByEntityName[entityName];
            if (array == null) {
                array = [];
                updatedObjectsByEntityName[entityName] = array;
            }
            array.addObject(updObj);
        }

        if (this.parent == null) {
            // Save to persistent store
            let saveRequest = new MIOSaveChangesRequest();
            saveRequest.initWithObjects(this.insertedObjects, this.updatedObjects, this.deletedObjects);
            //TODO: Execute save per store configuration            
            let store: MIOPersistentStore = this.persistentStoreCoordinator.persistentStores[0];
            store._executeRequest(saveRequest, this);

            //Clear values
            for (let index = 0; index < this.insertedObjects.count; index++) {
                let obj: MIOManagedObject = this.insertedObjects.objectAtIndex(index);
                obj._didCommit();
            }

            for (let index = 0; index < this.updatedObjects.count; index++) {
                let obj: MIOManagedObject = this.updatedObjects.objectAtIndex(index);
                obj._didCommit();
            }

            for (let index = 0; index < this.deletedObjects.count; index++) {
                let obj: MIOManagedObject = this.deletedObjects.objectAtIndex(index);
                obj._didCommit();
                this._unregisterObject(obj);
            }

            // Clear
            this.insertedObjects = MIOSet.set();
            this.updatedObjects = MIOSet.set();
            this.deletedObjects = MIOSet.set();
        }

        let objsChanges = {};
        objsChanges[MIOInsertedObjectsKey] = insertedObjectsByEntityName;
        objsChanges[MIOUpdatedObjectsKey] = updatedObjectsByEntityName;
        objsChanges[MIODeletedObjectsKey] = deletedObjectsByEntityName;

        let noty = new MIONotification(MIOManagedObjectContextDidSaveNotification, this, objsChanges);
        if (this.parent != null) {
            this.parent.mergeChangesFromContextDidSaveNotification(noty);
        }

        MIONotificationCenter.defaultCenter().postNotification(MIOManagedObjectContextDidSaveNotification, this, objsChanges);
    }

    mergeChangesFromContextDidSaveNotification(notification: MIONotification) {

        let insertedObjects = notification.userInfo[MIOInsertedObjectsKey];
        let updateObjects = notification.userInfo[MIOUpdatedObjectsKey];
        let deletedObjects = notification.userInfo[MIODeletedObjectsKey];

        // Inserted objects        
        for (let entityName in insertedObjects) {
            let ins_objs = insertedObjects[entityName];

            // save changes and add to context
            let array = this.insertedObjects[entityName];
            if (array == null) {
                array = [];
                this.insertedObjects[entityName] = array;
            }

            for (let i = 0; i < ins_objs.length; i++) {
                let o = ins_objs[i];
                let index = array.indexOf(o);
                if (index == -1)
                    array.push(o);
            }
        }

        // Update objects
        for (let entityName in updateObjects) {
            var upd_objs = updateObjects[entityName];

            let array = this.updatedObjects[entityName];
            if (array == null) {
                array = [];
                this.updatedObjects[entityName] = array;
            }

            for (let i = 0; i < upd_objs.length; i++) {
                let o = upd_objs[i];
                let index = array.indexOf(o);
                if (index == -1)
                    array.push(o);
            }
        }

        // Delete objects
        for (let entityName in deletedObjects) {
            let del_objs = deletedObjects[entityName];

            let array = this.deletedObjects[entityName];
            if (array == null) {
                array = [];
                this.deletedObjects[entityName] = array;
            }

            for (let i = 0; i < del_objs.length; i++) {
                let o = del_objs[i];
                let index = array.indexOf(o);
                if (index == -1)
                    array.push(o);
            }
        }
    }

    performBlockAndWait(target, block) {

        this.blockChanges = {};
        this.blockChanges[MIOInsertedObjectsKey] = {};
        this.blockChanges[MIOUpdatedObjectsKey] = {};
        this.blockChanges[MIODeletedObjectsKey] = {};
        this.blockChanges[MIORefreshedObjectsKey] = {};

        block.call(target);

        // Refresed block objects
        let refresed = this.blockChanges[MIORefreshedObjectsKey];
        //this.refreshObjectsFromStore(refresed);

        MIONotificationCenter.defaultCenter().postNotification(MIOManagedObjectContextObjectsDidChange, this, this.blockChanges);
        this.blockChanges = null;
    }

    reset(){
        let pss = {};
        
        for (let key in this.objectsByID){
            let obj:MIOManagedObject = this.objectsByID[key];
            
            let arr = pss[obj.objectID.persistentStore.identifier];
            if (arr == null) {
                arr = [];
                pss[obj.objectID.persistentStore.identifier] = arr;
            }

            arr.addObject(obj.objectID);
            obj._didCommit();
        }        

        for (let index = 0; index < this.persistentStoreCoordinator.persistentStores.length; index++){
            let ps = this.persistentStoreCoordinator.persistentStores[index];
            let objs = pss[ps.identifier];
            if (objs == null || objs.length == 0) continue;

            if (ps instanceof MIOIncrementalStore){
                let is = ps as MIOIncrementalStore;
                is.managedObjectContextDidUnregisterObjectsWithIDs(objs);
            }                        
        }        
        
        this.registerObjects = [];
        this.objectsByID = {};
        this.objectsByEntity = {};
        
        this.insertedObjects = MIOSet.set();
        this.updatedObjects = MIOSet.set();
        this.deletedObjects = MIOSet.set();        
    }

}

