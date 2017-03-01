/**
 * Created by godshadow on 12/4/16.
 */

/// <reference path="../MIOFoundation/MIOFoundation.ts" />


class MIOFetchRequest extends MIOObject
{
    entityName = null;
    predicate = null;
    sortDescriptors = null;

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
    managedObjectContext = null;

    private _trackChanges = {};

    setValue(propertyName, value)
    {
        var oldValue = this.getValue(propertyName);//this[propertyName];
        if (oldValue != value) {

            this._trackChanges[propertyName] = value;
            if (this.managedObjectContext != null)
                this.managedObjectContext.updateObject(this);
        }
    }

    getValue(propertyName)
    {
        var value = this._trackChanges[propertyName];
        if (value == null)
            value = this[propertyName];

        return value;
    }

    get hasChanges()
    {
        return (Object.keys(this._trackChanges).length > 0);
    }

    getChanges()
    {
        return this._trackChanges;
    }

    saveChanges()
    {
        for (var propertyName in this._trackChanges)
        {
            this[propertyName] = this._trackChanges[propertyName];
        }
        this._trackChanges = {};
    }

    discardChanges()
    {
        this._trackChanges = {};
    }
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
        obj.managedObjectContext = this;

        this.insertNewObject(obj);

        return obj;
    }

    insertNewObject(obj)
    {
        obj.saveChanges();

        var entityName = obj.entityName;
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
        //obj.saveChanges();

        var entityName = obj.entityName;
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
