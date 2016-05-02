/**
 * Created by godshadow on 12/4/16.
 */

    /// <reference path="MIOCore.ts" />
    /// <reference path="MIOObject.ts" />
    /// <reference path="MIOURLConnection.ts" />

class MIOEntity
{
    private entityName = null;
    private keyToRetreive = null;
    private baseURL = null;
    private getURL = null;
    private setURL = null;
    private httpMethod = "GET";
    private extraParams = null;

    callbacks = [];
    private isDownloaded = false;

    objects = [];

    constructor(name, keyToRetreive, baseURL, getCommand, setCommand?, httpMethod?, extraParams?)
    {
        this.entityName = name;
        this.keyToRetreive = keyToRetreive;
        this.baseURL = baseURL;
        this.getURL = getCommand;
        this.setURL = setCommand;
        if (httpMethod != null)
            this.httpMethod = httpMethod;
        this.extraParams = extraParams;
    }

    setCallback(target, callback)
    {
        var item = {"target" : target, "function" : callback, "updated" : false};
        this.callbacks.push(item);
    }

    removeCallback(target, callback)
    {
        var pos = -1;
        for (var index = 0; index < this.callbacks.length; index++)
        {
            var item = this.callbacks[index];
            if (item["target"] === target && item["function"] === callback) {
                pos = index;
                break;
            }
        }

        if (pos > -1)
            this.callbacks.splice(pos, 1);
    }

    execute()
    {
        if (this.isDownloaded == false)
        {
            var url = this.baseURL + this.getURL;
            var request = new MIOURLRequest(url);
            request.httpMethod = this.httpMethod;
            if (this.httpMethod == "POST" && this.extraParams != null)
                request.body = this.extraParams;
            var urlConnection = new MIOURLConnection();
            urlConnection.initWithRequestBlock(request, this, function (error, data) {

                if (error == false) {
                    var json = JSON.parse(data.replace(/(\r\n|\n|\r)/gm, ""));
                    this.setObjects(json[this.keyToRetreive]);
                    this.checkCallbacks();
                }
            });
        }

        return this.objects;
    }

    setObjects(items)
    {
        this.objects = [];

        for (var count = 0; count < items.length; count++) {

            var item = items[count];
            var obj = MIOClassFromString(this.entityName);
            obj.initWithJSObject(item);

            this.objects.push(obj);
        }

        this.isDownloaded = true;
    }

    checkCallbacks()
    {
        if (this.isDownloaded == false)
            return;

        for (var index = 0; index < this.callbacks.length; index++)
        {
            var item = this.callbacks[index];
            var target = item["target"];
            var callback = item["function"];
            var updated = item["updated"];

            if (updated == false)
            {
                callback.call(target, this.objects);
            }
        }
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
    entities = {};

    setEntity(entity)
    {
        this.entities[entity.entityName] = entity;
    }

    executeFetch(request, target, callback)
    {
        var e = this.entities[request.entityName];
        e.setCallback(target, callback);
        return e.execute();
    }

    removeFetch(request, target, callback)
    {
        var e = this.entities[request.entityName];
        e.removeCallback(target, callback);
    }
}
