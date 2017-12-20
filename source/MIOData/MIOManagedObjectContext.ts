/**
 * Created by godshadow on 12/4/16.
 */

/// <reference path="../MIOFoundation/MIOFoundation.ts" />
/// <reference path="MIOManagedObject.ts" />

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

    private insertedObjects = {};
    private deletedObjects = {};
    private updateObjects = {};

    private blockChanges = null;    

    initWithConcurrencyType(ct: MIOManagedObjectContextConcurrencyType) {

        super.init();
        this.concurrencyType = ct;
    }

    set parent(value: MIOManagedObjectContext) {
        this._parent = value;
        if (value != null) {
            this.persistentStoreCoordinator = value.persistentStoreCoordinator;
        }
    }

    get parent() {
        return this._parent;
    }

    insertObject(obj: MIOManagedObject) {
        let entityName = obj.entity.managedObjectClassName;        

        var array = this.insertedObjects[entityName];
        if (array == null) {
            array = [];
            array.push(obj);
            this.insertedObjects[entityName] = array;
        }
        else {
            var index = array.indexOf(obj);
            if (index == -1)
                array.push(obj);
        }

        var array = this.objectsByEntity[entityName];
        if (array == null) {
            array = [];
            this.objectsByEntity[entityName] = array;
        }
        array.push(obj);        
        this.objectsByID[obj.objectID.identifier] = obj;
    }

    updateObject(obj: MIOManagedObject) {
        if (obj.isInserted || obj.isDeleted) return;

        var entityName = obj.entity.managedObjectClassName;
        var array = this.updateObjects[entityName];
        if (array == null) {
            array = [];
            array.push(obj);
            this.updateObjects[entityName] = array;
        }
        else {
            var index = array.indexOf(obj);
            if (index == -1)
                array.push(obj);
        }
    }

    deleteObject(obj:MIOManagedObject) {
        var entityName = obj.entity.managedObjectClassName;
        var array = this.deletedObjects[entityName];
        if (array == null) {
            array = [];
            array.push(obj);
            this.deletedObjects[entityName] = array;
        }
        else {
            var index = array.indexOf(obj);
            if (index == -1)
                array.push(obj);
        }
        
        delete this.objectsByID[obj.objectID.identifier];
        let objs = this.objectsByEntity[entityName];
        if (objs != null){
            var index = objs.indexOf(obj);
            if (index > -1)
                objs.splice(index, 1);
        }        

        // TODO: Delete this hack.
        obj._markForDeletion();
    }

    private registerObject(object:MIOManagedObject){

        if (object == null) throw ("MIOManagedObjectContext: Registering null object");
        let objectID = object.objectID;

        this.objectsByID[objectID.identifier] = object;
        let entityName = object.entity.name;
        var array = this.objectsByEntity[entityName];
        if (array == null) {
            array = [];
            this.objectsByEntity[entityName] = array;
        }
        array.push(object);
    }

    existingObjectWithID(objectID:MIOManagedObjectID):MIOManagedObject{

        var obj = this.objectsByID[objectID.identifier];
        if (obj == null) {
            obj = this.persistentStoreCoordinator.fetchObjectWithObjectID(objectID, this, false);
            if (obj != null) {
                this.registerObject(obj);
                obj.isFault = true;
            }
        }

        return obj;
    }

    refreshObject(object:MIOManagedObject, mergeChanges:boolean) {

        if (mergeChanges == false) return;

        var changes = null;
        if (this.blockChanges != null){
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
            this.persistentStoreCoordinator.updateObjectWithObjectID(object.objectID, this);            
            MIONotificationCenter.defaultCenter().postNotification(MIOManagedObjectContextObjectsDidChange, this, objs);            
        }        
    }     

    private addObjectToTracking(objectTracking, object:MIOManagedObject) {
        var array = objectTracking[object.entity.name];
        if (array == null) {
            array = [];
            objectTracking[object.entity.name] = array;
        }
        array.push(object);        
    }

    private removeObjectFromTracking(objectTracking, object:MIOManagedObject){        
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

    objectWithID(objectID:MIOManagedObjectID){

        var obj = this.objectsByID[objectID.identifier];
        if (obj == null) {
            obj = this.persistentStoreCoordinator.fetchObjectWithObjectID(objectID, this, true);
            if (obj != null) {
                this.registerObject(obj);
                this.refreshObject(obj, true);
            }
        }
        return obj;
    }

    executeFetch(request) {
        
        let entityName = request.entityName;
        let entity = MIOEntityDescription.entityForNameInManagedObjectContext(entityName, this);
        request.entity = entity;
        
        var objs = this.persistentStoreCoordinator.executeRequest(request, this);
        
        let array = this.objectsByEntity[entityName];
        if (array == null) {
            array = [];
            this.objectsByEntity[entityName] = array;
        }

        for (var index = 0; index < objs.length; index++){
            let o = objs[index];
            let i = array.indexOf(o);
            if (i == -1)
                array.push(o);
            this.objectsByID[o.objectID] = o;
        }

        if (request instanceof MIOFetchRequest) {        
            let fetchRequest = request as MIOFetchRequest;
            var objects = _MIOPredicateFilterObjects(array, fetchRequest.predicate);
            objects = _MIOSortDescriptorSortObjects(objects, fetchRequest.sortDescriptors);
            return objects;
        }

        return [];
    }

    save() {

        let insertedCount = Object.keys(this.insertedObjects).length;
        let updatedCount = Object.keys(this.updateObjects).length;
        let deletedCount = Object.keys(this.deletedObjects).length;

        // Check if nothing changed... to avoid unnecessay methods calls
        if (insertedCount == 0 && updatedCount == 0 && deletedCount == 0) return;

        if (this.parent == null) {
            // Save to persistent store
            let saveRequest = new MIOSaveChangesRequest();
            saveRequest.initWithObjects(this.insertedObjects, this.updateObjects, this.deletedObjects);
            this.persistentStoreCoordinator.executeRequest(saveRequest, this);
        }

        var objsChanges = {};
        objsChanges[MIOInsertedObjectsKey] = this.insertedObjects;
        objsChanges[MIOUpdatedObjectsKey] = this.updateObjects;
        objsChanges[MIODeletedObjectsKey] = this.deletedObjects;

        let noty = new MIONotification(MIOManagedObjectContextDidSaveNotification, this, objsChanges);
        if (this.parent != null) {            
            this.parent.mergeChangesFromContextDidSaveNotification(noty);
        }
        else {
            this.mergeChangesFromContextDidSaveNotification(noty);
        }
        
        MIONotificationCenter.defaultCenter().postNotification(MIOManagedObjectContextDidSaveNotification, this, objsChanges);        

        // Clear arrays
        this.insertedObjects = [];
        this.updateObjects = [];
        this.deletedObjects = [];
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

            var array = this.updateObjects[entityName];
            if (array == null) {
                array = [];
                this.updateObjects[entityName] = array;
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
    
    performBlockAndWait(target, block){

        this.blockChanges = {};
        this.blockChanges[MIOInsertedObjectsKey] = {};
        this.blockChanges[MIOUpdatedObjectsKey] = {};
        this.blockChanges[MIODeletedObjectsKey] = {};
        this.blockChanges[MIORefreshedObjectsKey] = {};

        block.call(target);

        // Refresed block objects
        let refresed = this.blockChanges[MIORefreshedObjectsKey];
        this.refreshObjectsFromStore(refresed);
        
        MIONotificationCenter.defaultCenter().postNotification(MIOManagedObjectContextObjectsDidChange, this, this.blockChanges);
        this.blockChanges = null;
    }

    private refreshObjectsFromStore(objects){

        for (var entityName in objects) {

            let set:MIOSet = objects[entityName];            
            for(var index = 0; index < set.length; index++) {
                let object = set.objectAtIndex(index);
                this.persistentStoreCoordinator.updateObjectWithObjectID(object.objectID, this);
            }
        }
    }

}

