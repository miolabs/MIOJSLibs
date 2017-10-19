/**
 * Created by godshadow on 12/4/16.
 */

/// <reference path="../MIOFoundation/MIOFoundation.ts" />
/// <reference path="MIOManagedObject.ts" />

let MIOManagedObjectContextDidSaveNotification = "MIOManagedObjectContextDidSaveNotification";

let MIOInsertedObjectsKey = "MIOInsertedObjectsKey";
let MIOUpdatedObjectsKey = "MIOUpdatedObjectsKey";
let MIODeletedObjectsKey = "MIODeletedObjectsKey";

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
        var entityName = obj.entity.managedObjectClassName;        

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

    deleteObject(obj) {
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

        // TODO: Delete this hack.
        obj._markForDeletion();
    }

    removeAllObjectsForEntityName(entityName) {
        var objs = this.objectsByEntity[entityName];
        if (objs != null) {
            for (var index = 0; index < objs.length; index++) {
                var o = objs[index];
                this.deleteObject(o);
            }
        }
    }

    executeFetch(request) {
        
        var objs = this.persistentStoreCoordinator.executeRequest(request, this);

        let entityName = request.entityName;
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
        }

        return objs;
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

        if (this.parent != null) {
            let noty = new MIONotification(MIOManagedObjectContextDidSaveNotification, this, objsChanges);
            this.parent.mergeChangesFromContextDidSaveNotification(noty);
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

    //
    // TODO: Remove this. It's not Cocoa compatible
    //

    queryObjects(entityName, predicate?) {

        let request = MIOFetchRequest.fetchRequestWithEntityName(entityName);

        if (predicate != null)
            request.predicate = predicate;

        let objs = this.executeFetch(request);
        return objs;
    }

    queryObject(entityName, predicate?) {

        let objs = this.queryObjects(entityName, predicate);
        return objs.length > 0 ? objs[0] : null;
    }
}

