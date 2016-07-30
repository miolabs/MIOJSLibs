/**
 * Created by godshadow on 12/4/16.
 */

    /// <reference path="MIOCore.ts" />
    /// <reference path="MIOObject.ts" />
    /// <reference path="MIOURLConnection.ts" />
    /// <reference path="MIONotificationCenter.ts" />
    /// <reference path="MIOPredicate.ts" />

class MIOFetchRequest extends MIOObject
{
    entityName = null;
    predicate = null;

    static fetchRequestWithEntityName(name)
    {
        var fetch = new MIOFetchRequest();
        fetch.initWithEntityName(name);

        return fetch;
    }

    initWithEntityName(name)
    {
        this.entityName = name;
    }

    setPredicate(predicate)
    {
        this.predicate = predicate;
    }
}

class MIOEntityDescription extends MIOObject
{
    private entityName = null;

    public static insertNewObjectForEntityForName(entityName, context)
    {
        var object = context.insertNewObjectForEntityName(entityName);

        return object;
    }
}

class MIOManagedObject extends MIOObject
{
    entityName = null;
}

class MIOManagedObjectContext extends MIOObject
{
    private _objects = {};

    private _insertedObjects = {};
    private _deletedObjects = {};
    private _updateObjects = {};

    _persistentStoreCoordinator = null;

    insertNewObjectForEntityName(entityName)
    {
        var obj = MIOClassFromString(entityName);
        obj.entityName = entityName;

        this.insertNewObject(obj);

        return obj;
    }

    insertNewObject(obj)
    {
        var entityName = obj.entityName;
        var array = this._insertedObjects[entityName];
        if (array == null)
        {
            array = [];
            this._insertedObjects[entityName] = array;
        }

        array.push(obj);
    }

    updateObject(obj)
    {
        var entityName = obj.entityName;
        var array = this._insertedObjects[entityName];
        if (array == null)
        {
            array = [];
            this._updateObjects[entityName] = array;
            array.push(obj);
        }
        else
        {
            var index = array.indexOf(obj);
            if (index == -1)
                array.push(obj);
        }
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
        var resultObjs = this._filterObjects(objs, request.predicate);

        return resultObjs;
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

    saveContext()
    {
        // Inserted objects
        for (var key in this._insertedObjects)
        {
            var objs = this._insertedObjects[key];

            var array = this._objects[key];
            if (array == null)
            {
                array = [];
                this._objects[key] = array;
            }

            array.push.apply(array, objs);

            // Clear array
            this._insertedObjects = [];

            MIONotificationCenter.defaultCenter().postNotification("MIO" + key, objs, "INSERTED");
        }

        // Update objects
        for (var key in this._updateObjects)
        {
            var objs = this._updateObjects[key];

            // Clear array
            this._updateObjects = [];

            MIONotificationCenter.defaultCenter().postNotification("MIO" + key, objs, "UPDATED");
        }
    }

    queryObject(entityName, predicateFormat?)
    {
        var request = MIOFetchRequest.fetchRequestWithEntityName(entityName);

        if (predicateFormat != null)
            request.predicate = MIOPredicate.predicateWithFormat(predicateFormat);

        return this.executeFetch(request);
    }

    setPersistentStoreCoordinator(coordinator)
    {

    }
}

class MIOManagedObjectModel extends MIOObject
{

}

class MIOPersistentStoreCoordinator extends MIOObject
{
    _managedObjectModel = null;

    get managedObjectModel()
    {
        if (this._managedObjectModel != null)
            return this._managedObjectModel;

        return this._managedObjectModel;
    }
}

class  MIOPersistentStore extends MIOObject
{

}
