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

}

class MIOManagedObjectContext extends MIOObject
{
    parentContext:MIOManagedObjectContext = null;
    persistentStoreCoordinator:MIOPersistentStoreCoordinator = null;

    concurrencyType = MIOManagedObjectContextConcurrencyType.MainQueue;
    mergePolicy = "";

    private _managedObjectChanges = {};

    private _objects = {};

    private _insertedObjects = {};
    private _deletedObjects = {};
    private _updateObjects = {};

    initWithConcurrencyType(ct:MIOManagedObjectContextConcurrencyType) {

        super.init();
        this.concurrencyType = ct;
    }

    insertObject(obj)
    {
        var entityName = obj.entity.managedObjectClassName;
        var array = this._insertedObjects[entityName];
        if (array == null)
        {
            array = [];
            array.push(obj);
            this._insertedObjects[entityName] = array;
        }
        else
        {
            var index = array.indexOf(obj);
            if (index == -1)
                array.push(obj);            
        }
    }

    updateObject(obj:MIOManagedObject)
    {
        if (obj.isInserted || obj.isDeleted) return;
        
        var entityName = obj.entity.managedObjectClassName;
        var array = this._updateObjects[entityName];
        if (array == null)
        {
            array = [];
            array.push(obj);
            this._updateObjects[entityName] = array;
        }
        else
        {
            var index = array.indexOf(obj);
            if (index == -1)
                array.push(obj);
        }
    }

    deleteObject(obj)
    {
        var entityName = obj.entity.managedObjectClassName;
        var array = this._deletedObjects[entityName];
        if (array == null)
        {
            array = [];
            array.push(obj);
            this._deletedObjects[entityName] = array;
        }
        else
        {
            var index = array.indexOf(obj);
            if (index == -1)
                array.push(obj);
        }

        // TODO: Delete this hack.
        obj._markForDeletion();
    }

    removeAllObjectsForEntityName(entityName)
    {
        var objs = this._objects [entityName];
        if (objs != null) {
            for(var index = 0; index < objs.length; index++){
                var o = objs[index];
                this.deleteObject(o);
            }
        }
    }

    executeFetch(request)
    {
        var objs = this.persistentStoreCoordinator.executeRequest(request, this);
        //var objs = this._objects[request.entityName];
        //objs = this._filterObjects(objs, request.predicate);
        //objs = this._sortObjects(objs, request.sortDescriptors);

        return objs;
    }

    private _filterObjects(objs, predicate)
    {
        if (objs == null)
            return [];

        var resultObjects = null;

        if (predicate == null)
            resultObjects = objs;
        else
        {
            resultObjects = objs.filter(function(obj){

                var result = predicate.evaluateObject(obj);
                if (result)
                    return obj;
            });
        }

        return resultObjects;
    }

    private _sortObjects(objs, sortDescriptors)
    {
        if (sortDescriptors == null)
            return objs;

        var instance = this;
        var resultObjects = objs.sort(function(a, b){

            return instance._sortObjects2(a, b, sortDescriptors, 0);
        });

        return resultObjects;
    }

    private _sortObjects2(a, b, sortDescriptors, index)
    {
        if (index >= sortDescriptors.length)
            return 0;

        var sd = sortDescriptors[index];
        var key = sd.key;

        if (a[key] == b[key]) {

            if (a[key]== b[key])
            {
                return this._sortObjects2(a, b, sortDescriptors, ++index);
            }
            else if (a[key] < b[key])
                return sd.ascending ? -1 : 1;
            else
                return sd.ascending ? 1 : -1;
        }
        else if (a[key] < b[key])
            return sd.ascending ? -1 : 1;
        else
            return sd.ascending ? 1 : -1;

    }

    save()
    {
        // Remove objects
        for (var key in this._deletedObjects)
        {
            var del_objs = this._deletedObjects[key];
            var objects = this._objects[key];

            // save changes
            for (var i = 0; i < del_objs.length; i++)
            {
                var o = del_objs[i];
                
                var index = objects.indexOf(o);

                if(index > -1) {
                    objects.splice(index, 1);
                }
            }
        }

        // Inserted objects        
        for (var key in this._insertedObjects)
        {
            var ins_objs = this._insertedObjects[key];

            // save changes and add to context
            var array = this._objects[key];
            if (array == null) {
                array = [];
                this._objects[key] = array;
            }

            for (var i = 0; i < ins_objs.length; i++)
            {
                var o = ins_objs[i];
                o.saveChanges();
                array.push(o);
            }            
        }

        // Update objects
        for (var key in this._updateObjects)
        {
            var upd_objs = this._updateObjects[key];

            // save changes
            for (var i = 0; i < upd_objs.length; i++)
            {
                var o = upd_objs[i];
                o.saveChanges();
            }
        }

        let saveRequest = new MIOSaveChangesRequest();
        saveRequest.initWithObjects(this._insertedObjects, this._updateObjects, this._deletedObjects);
        this.persistentStoreCoordinator.executeRequest(saveRequest, this);

        var objsChanges = {};        
        objsChanges[MIOInsertedObjectsKey] = this._insertedObjects;
        objsChanges[MIOUpdatedObjectsKey] = this._updateObjects;
        objsChanges[MIODeletedObjectsKey] = this._deletedObjects;

        MIONotificationCenter.defaultCenter().postNotification(MIOManagedObjectContextDidSaveNotification, objsChanges);

        // Clear arrays
        this._insertedObjects = [];
        this._updateObjects = [];
        this._deletedObjects = [];        
    }

    queryObject(entityName, predicate?)
    {
        let request = MIOFetchRequest.fetchRequestWithEntityName(entityName);

        if (predicate != null)
            request.predicate = predicate;

        let objs = this.executeFetch(request);

        return objs.length > 0 ? objs[0] : null;
    }
}

