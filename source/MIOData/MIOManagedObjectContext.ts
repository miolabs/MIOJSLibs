/**
 * Created by godshadow on 12/4/16.
 */

/// <reference path="../MIOFoundation/MIOFoundation.ts" />
/// <reference path="MIOManagedObject.ts" />
/// <reference path="MIOPersistentStore.ts" />


let MIOManagedObjectContextWillSaveNotification = "MIOManagedObjectContextWillSaveNotification";
let MIOManagedObjectContextDidSaveNotification = "MIOManagedObjectContextDidSaveNotification";
let MIOManagedObjectContextObjectsDidChange = "MIOManagedObjectContextObjectsDidChange";

let MIOInsertedObjectsKey = "MIOInsertedObjectsKey";
let MIOUpdatedObjectsKey = "MIOUpdatedObjectsKey";
let MIODeletedObjectsKey = "MIODeletedObjectsKey";
let MIORefreshedObjectsKey = "MIORefreshedObjectsKey";

enum MIOManagedObjectContextConcurrencyType {
    PrivateQueue,
    MainQueue
}

enum NSMergePolicy {
    None
}

class MIOManagedObjectContext extends MIOObject {
    persistentStoreCoordinator: MIOPersistentStoreCoordinator = null;

    concurrencyType = MIOManagedObjectContextConcurrencyType.MainQueue;
    mergePolicy = "";

    private _parent: MIOManagedObjectContext = null;

    private managedObjectChanges = {};

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

    // insertObject(obj: MIOManagedObject) {
    //     let entityName = obj.entity.managedObjectClassName;

    //     var array = this.insertedObjects[entityName];
    //     if (array == null) {
    //         array = [];
    //         array.push(obj);
    //         this.insertedObjects[entityName] = array;
    //     }
    //     else {
    //         var index = array.indexOf(obj);
    //         if (index == -1)
    //             array.push(obj);
    //     }

    //     var array = this.objectsByEntity[entityName];
    //     if (array == null) {
    //         array = [];
    //         this.objectsByEntity[entityName] = array;
    //     }
    //     array.push(obj);        
    //     this.objectsByID[obj.objectID.identifier] = obj;
    // }

    private registerObjects = [];
    private _registerObject(object: MIOManagedObject) {

        if (this.objectsByID[object.objectID.URIRepresentation.absoluteString] != null) return;

        this.registerObjects.addObject(object);
        this.objectsByID[object.objectID.URIRepresentation.absoluteString] = object;

        let entityName = object.entity.name;
        let array = this.objectsByEntity[entityName];
        if (array == null) {
            array = [];
            this.objectsByEntity[entityName] = array;
        }
        array.addObject(object);
    }

    private _unregisterObject(object: MIOManagedObject) {
        this.registerObjects.removeObject(object);
        delete this.objectsByID[object.objectID.URIRepresentation.absoluteString];

        let entityName = object.entity.name;
        let array = this.objectsByEntity[entityName];
        if (array != null) {
            array.removeObject(object);
        }
    }

    insertObject(object: MIOManagedObject) {
        let store = this.persistentStoreCoordinator._persistentStoreForObject(object);
        let objectID = object.objectID;

        objectID._setStoreIdentifier(store.identifier);
        objectID._setPersistentStore(store);

        this.insertedObjects.addObject(object);
        this._registerObject(object);
        object._setIsInserted(true);
    }

    // updateObject(obj: MIOManagedObject) {
    //     if (obj.isInserted || obj.isDeleted) return;

    //     var entityName = obj.entity.managedObjectClassName;
    //     var array = this.updateObjects[entityName];
    //     if (array == null) {
    //         array = [];
    //         array.push(obj);
    //         this.updateObjects[entityName] = array;
    //     }
    //     else {
    //         var index = array.indexOf(obj);
    //         if (index == -1)
    //             array.push(obj);
    //     }
    // }

    updateObject(object: MIOManagedObject) {
        if (this.insertedObjects.containsObject(object)) return;
        this.updatedObjects.addObject(object);
        object._setIsUpdated(true);
    }

    // deleteObject(obj:MIOManagedObject) {
    //     var entityName = obj.entity.managedObjectClassName;
    //     var array = this.deletedObjects[entityName];
    //     if (array == null) {
    //         array = [];
    //         array.push(obj);
    //         this.deletedObjects[entityName] = array;
    //     }
    //     else {
    //         var index = array.indexOf(obj);
    //         if (index == -1)
    //             array.push(obj);
    //     }

    //     delete this.objectsByID[obj.objectID.identifier];
    //     let objs = this.objectsByEntity[entityName];
    //     if (objs != null){
    //         var index = objs.indexOf(obj);
    //         if (index > -1)
    //             objs.splice(index, 1);
    //     }        

    //     // TODO: Delete this hack.
    //     obj._markForDeletion();
    // }

    deleteObject(object: MIOManagedObject) {
        this.insertedObjects.removeObject(object);
        object._setIsInserted(false);
        this.updatedObjects.removeObject(object);
        object._setIsUpdated(false);
        this.deletedObjects.addObject(object);
        object._setIsDeleted(true);
        //this._unregisterObject(object);
    }

    // private registerObject(object: MIOManagedObject) {

    //     if (object == null) throw ("MIOManagedObjectContext: Registering null object");
    //     let objectID = object.objectID;

    //     this.objectsByID[objectID.identifier] = object;
    //     let entityName = object.entity.name;
    //     var array = this.objectsByEntity[entityName];
    //     if (array == null) {
    //         array = [];
    //         this.objectsByEntity[entityName] = array;
    //     }
    //     array.push(object);
    // }

    _objectWithURIRepresentationString(urlString:string){
        return this.objectsByID[urlString];
    }

    objectWithID(objectID: MIOManagedObjectID) {

        var obj:MIOManagedObject = this.objectsByID[objectID.URIRepresentation.absoluteString];
        if (obj == null) {
            obj = MIOClassFromString(objectID.entity.name);
            obj._initWithObjectID(objectID, this);  
            this._registerObject(obj);               
        }
        return obj;
    }

    existingObjectWithID(objectID: MIOManagedObjectID): MIOManagedObject {

        var obj: MIOManagedObject = this.objectsByID[objectID.URIRepresentation.absoluteString];

        let store:MIOIncrementalStore = objectID.persistentStore as MIOIncrementalStore;
        let node:MIOIncrementalStoreNode = store._nodeForObjectID(objectID, this);

        if (obj != null && node != null && obj._version < node.version){
            obj._setIsFault(true);
        }
        else if (obj == null && node != null){
            obj = MIOClassFromString(objectID.entity.name);
            obj._initWithObjectID(objectID, this);
            this._registerObject(obj);
        }

        return obj;
    }

    refreshObject(object: MIOManagedObject, mergeChanges: boolean) {

        if (mergeChanges == false) return;

        if (object.isFault == false) return;

        var changes = null;
        if (this.blockChanges != null) {
            changes = this.blockChanges;
        }
        else {
            changes = {};
            changes[MIORefreshedObjectsKey] = {};
        }

        let entityName = object.entity.name;
        let objs = changes[MIORefreshedObjectsKey];

        var set = objs[entityName];
        if (set == null) {
            set = MIOSet.set();
            objs[entityName] = set;
        }

        set.addObject(object);

        if (this.blockChanges == null) {
            //this.persistentStoreCoordinator.updateObjectWithObjectID(object.objectID, this); 
            //object.isFault = false;           
            MIONotificationCenter.defaultCenter().postNotification(MIOManagedObjectContextObjectsDidChange, this, objs);
        }
    }

    private addObjectToTracking(objectTracking, object: MIOManagedObject) {
        var array = objectTracking[object.entity.name];
        if (array == null) {
            array = [];
            objectTracking[object.entity.name] = array;
        }
        array.push(object);
    }

    private removeObjectFromTracking(objectTracking, object: MIOManagedObject) {
        var array = objectTracking[object.entity.name];
        if (array == null) return;
        let index = array.indexOf(object);
        if (index > -1) array.splice(index, 1);
    }

    removeAllObjectsForEntityName(entityName) {
        var objs = this.objectsByEntity[entityName];
        if (objs != null) {
            for (var index = objs.length - 1; index >= 0; index--) {
                var o = objs[index];
                this.deleteObject(o);
            }
        }
    }

    // executeFetch(request) {

    //     let entityName = request.entityName;
    //     let entity = MIOEntityDescription.entityForNameInManagedObjectContext(entityName, this);
    //     request.entity = entity;

    //     var objs = this.persistentStoreCoordinator.executeRequest(request, this);

    //     let array = this.objectsByEntity[entityName];
    //     if (array == null) {
    //         array = [];
    //         this.objectsByEntity[entityName] = array;
    //     }

    //     for (var index = 0; index < objs.length; index++) {
    //         let o = objs[index];
    //         let i = array.indexOf(o);
    //         if (i == -1)
    //             array.push(o);
    //         this.objectsByID[o.objectID] = o;
    //     }

    //     if (request instanceof MIOFetchRequest) {
    //         let fetchRequest = request as MIOFetchRequest;
    //         var objects = _MIOPredicateFilterObjects(array, fetchRequest.predicate);
    //         objects = _MIOSortDescriptorSortObjects(objects, fetchRequest.sortDescriptors);
    //         return objects;
    //     }

    //     return [];
    // }

    executeFetch(request) {

        let entityName = request.entityName;
        let entity = MIOEntityDescription.entityForNameInManagedObjectContext(entityName, this);
        request.entity = entity;

        //TODO: get the store from configuration name
        let store: MIOPersistentStore = this.persistentStoreCoordinator.persistentStores[0];
        var objs = store._executeRequest(request, this);

        for (var index = 0; index < objs.length; index++) {
            let o = objs[index];
            this._registerObject(o);
        }

        if (request instanceof MIOFetchRequest) {
            let fetchRequest = request as MIOFetchRequest;
            var objects = _MIOPredicateFilterObjects(this.objectsByEntity[entityName], fetchRequest.predicate);
            objects = _MIOSortDescriptorSortObjects(objects, fetchRequest.sortDescriptors);
            return objects;
        }

        return [];
    }

    // save() {

    //     let insertedCount = Object.keys(this.insertedObjects).length;
    //     let updatedCount = Object.keys(this.updateObjects).length;
    //     let deletedCount = Object.keys(this.deletedObjects).length;

    //     // Check if nothing changed... to avoid unnecessay methods calls
    //     if (insertedCount == 0 && updatedCount == 0 && deletedCount == 0) return;

    //     if (this.parent == null) {
    //         // Save to persistent store
    //         let saveRequest = new MIOSaveChangesRequest();
    //         saveRequest.initWithObjects(this.insertedObjects, this.updateObjects, this.deletedObjects);
    //         this.persistentStoreCoordinator.executeRequest(saveRequest, this);
    //     }

    //     var objsChanges = {};
    //     objsChanges[MIOInsertedObjectsKey] = this.insertedObjects;
    //     objsChanges[MIOUpdatedObjectsKey] = this.updateObjects;
    //     objsChanges[MIODeletedObjectsKey] = this.deletedObjects;

    //     let noty = new MIONotification(MIOManagedObjectContextDidSaveNotification, this, objsChanges);
    //     if (this.parent != null) {            
    //         this.parent.mergeChangesFromContextDidSaveNotification(noty);
    //     }
    //     else {
    //         this.mergeChangesFromContextDidSaveNotification(noty);
    //     }

    //     MIONotificationCenter.defaultCenter().postNotification(MIOManagedObjectContextDidSaveNotification, this, objsChanges);        

    //     // Clear arrays
    //     this.insertedObjects = [];
    //     this.updateObjects = [];
    //     this.deletedObjects = [];
    // }

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
        var deletedObjectsByEntityName = {};
        for (var index = 0; index < this.deletedObjects.count; index++) {
            let delObj: MIOManagedObject = this.deletedObjects.objectAtIndex(index);

            // Track object for save notification
            let entityName = delObj.entity.name;
            var array = deletedObjectsByEntityName[entityName];
            if (array == null) {
                array = [];
                deletedObjectsByEntityName[entityName] = array;
            }
            array.addObject(delObj);
        }

        // Inserted objects
        var insertedObjectsByEntityName = {};
        for (var index = 0; index < this.insertedObjects.count; index++) {
            let insObj: MIOManagedObject = this.insertedObjects.objectAtIndex(index);

            this._obtainPermanentIDForObject(insObj);

            // Track object for save notification
            let entityName = insObj.entity.name;
            var array = insertedObjectsByEntityName[entityName];
            if (array == null) {
                array = [];
                insertedObjectsByEntityName[entityName] = array;
            }
            array.addObject(insObj);
        }

        // Updated objects
        var updatedObjectsByEntityName = {};
        for (var index = 0; index < this.updatedObjects.count; index++) {
            let updObj: MIOManagedObject = this.updatedObjects.objectAtIndex(index);

            // Track object for save notification
            let entityName = updObj.entity.name;
            var array = updatedObjectsByEntityName[entityName];
            if (array == null) {
                array = [];
                updatedObjectsByEntityName[entityName] = array;
            }
            array.addObject(updObj);
        }

        if (this.parent == null) {
            // Save to persistent store
            let saveRequest = new MIOSaveChangesRequest();
            saveRequest.initWithObjects(insertedObjectsByEntityName, updatedObjectsByEntityName, deletedObjectsByEntityName);
            //TODO: Execute save per store configuration            
            let store: MIOPersistentStore = this.persistentStoreCoordinator.persistentStores[0];
            store._executeRequest(saveRequest, this);

            //Clear values
            for (var index = 0; index < this.insertedObjects.length; index++) {
                let obj: MIOManagedObject = this.insertedObjects.objectAtIndex(index);
                obj._didCommit();
            }

            for (var index = 0; index < this.updatedObjects.length; index++) {
                let obj: MIOManagedObject = this.updatedObjects.objectAtIndex(index);
                obj._didCommit();
            }

            for (var index = 0; index < this.deletedObjects.length; index++) {
                let obj: MIOManagedObject = this.deletedObjects.objectAtIndex(index);
                obj._didCommit();
            }

            // Clear
            this.insertedObjects = MIOSet.set();
            this.updatedObjects = MIOSet.set();
            this.deletedObjects = MIOSet.set();
        }

        var objsChanges = {};
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
        for (var entityName in insertedObjects) {
            var ins_objs = insertedObjects[entityName];

            // save changes and add to context
            var array = this.insertedObjects[entityName];
            if (array == null) {
                array = [];
                this.insertedObjects[entityName] = array;
            }

            for (var i = 0; i < ins_objs.length; i++) {
                let o = ins_objs[i];
                let index = array.indexOf(o);
                if (index == -1)
                    array.push(o);
            }
        }

        // Update objects
        for (var entityName in updateObjects) {
            var upd_objs = updateObjects[entityName];

            var array = this.updatedObjects[entityName];
            if (array == null) {
                array = [];
                this.updatedObjects[entityName] = array;
            }

            for (var i = 0; i < upd_objs.length; i++) {
                let o = upd_objs[i];
                let index = array.indexOf(o);
                if (index == -1)
                    array.push(o);
            }
        }

        // Delete objects
        for (var entityName in deletedObjects) {
            var del_objs = deletedObjects[entityName];

            var array = this.deletedObjects[entityName];
            if (array == null) {
                array = [];
                this.deletedObjects[entityName] = array;
            }

            for (var i = 0; i < del_objs.length; i++) {
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

    private refreshObjectsFromStore(objects) {

        for (var entityName in objects) {

            let set: MIOSet = objects[entityName];
            for (var index = 0; index < set.length; index++) {
                let object = set.objectAtIndex(index);
                this.persistentStoreCoordinator.updateObjectWithObjectID(object.objectID, this);
                //object.isFault = false;                
            }
        }
    }

}

