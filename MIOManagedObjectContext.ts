/**
 * Created by godshadow on 12/4/16.
 */

    /// <reference path="MIOCore.ts" />
    /// <reference path="MIOObject.ts" />
    /// <reference path="MIOURLConnection.ts" />

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
    initWithJSObject(obj)
    {

    }

    getJSObject()
    {
        return "";
    }
}

class MIOManagedObjectContext extends MIOObject
{
    objects = {};

    _persistentStoreCoordinator = null;

    insertNewObjectForEntityName(entityName)
    {
        var obj = MIOClassFromString(entityName);

        var array = this.objects[entityName];
        if (array == null)
        {
            array = [];
            this.objects[entityName] = array;
        }

        array.push(obj);

        return obj;
    }

    setPersistentStoreCoordinator(coordinator)
    {

    }

    executeFetch(request)
    {
        var objs = this.objects[request.entityName];
        return objs;
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
