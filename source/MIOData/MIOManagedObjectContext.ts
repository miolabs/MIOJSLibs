/**
 * Created by godshadow on 12/4/16.
 */

/// <reference path="../MIOFoundation/MIOFoundation.ts" />
/// <reference path="MIOManagedObject.ts" />

class MIOManagedObjectContext extends MIOObject
{
    parentContext:MIOManagedObjectContext = null;
    persistentStoreCoordinator:MIOPersistentStoreCoordinator = null;

    private _objects = {};

    private _insertedObjects = {};
    private _deletedObjects = {};
    private _updateObjects = {};

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
            array.push(obj);
        }
    }

    updateObject(obj)
    {
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

        // TODO: Hack.
        obj._markForDeletion();
    }

    removeAllObjectsForEntityName(entityName)
    {
        var objs = this._objects [entityName];
        if (objs != null)
            objs.length = 0;
    }

    executeFetch(request)
    {
        var objs = this._objects[request.entityName];
        objs = this._filterObjects(objs, request.predicate);
        objs = this._sortObjects(objs, request.sortDescriptors);

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

    // DEPRECATED: -> Change to save();
    saveContext() {
        this.save();
    }
    
    save()
    {
        // Inserted objects
        for (var key in this._insertedObjects)
        {
            var objs = this._insertedObjects[key];

            // save changes and add to context
            var array = this._objects[key];
            if (array == null) {
                array = [];
                this._objects[key] = array;
            }
            for (var i = 0; i < objs.length; i++)
            {
                var o = objs[i];
                o.saveChanges();
                array.push(o);
            }

            MIONotificationCenter.defaultCenter().postNotification("MIO" + key, objs, "INSERTED");
        }

        // Clear array
        this._insertedObjects = [];

        // Update objects
        for (var key in this._updateObjects)
        {
            var objs = this._updateObjects[key];

            // save changes
            for (var i = 0; i < objs.length; i++)
            {
                var o = objs[i];
                o.saveChanges();
            }

            MIONotificationCenter.defaultCenter().postNotification("MIO" + key, objs, "UPDATED");
        }

        // Clear array
        this._updateObjects = [];

        // Remove objects
        for (var key in this._deletedObjects)
        {
            var objs = this._deletedObjects[key];

            // save changes
            for (var i = 0; i < objs.length; i++)
            {
                var o = objs[i];
                var objects = this._objects[o.entity.managedObjectClassName];
                var index = objects.indexOf(o);

                if(index > -1) {
                    objects.splice(index, 1);
                }
            }

            MIONotificationCenter.defaultCenter().postNotification("MIO" + key, objs, "DELETED");
        }

        // Clear array
        this._deletedObjects = [];
    }

    queryObject(entityName, predicateFormat?)
    {
        var request = MIOFetchRequest.fetchRequestWithEntityName(entityName);

        if (predicateFormat != null)
            request.predicate = MIOPredicate.predicateWithFormat(predicateFormat);

        return this.executeFetch(request);
    }
}

