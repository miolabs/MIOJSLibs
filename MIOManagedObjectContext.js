/**
 * Created by godshadow on 12/4/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOCore.ts" />
/// <reference path="MIOObject.ts" />
/// <reference path="MIOURLConnection.ts" />
var MIOEntity = (function () {
    function MIOEntity(name, keyToRetreive, baseURL, getCommand, setCommand, httpMethod, extraParams) {
        this.entityName = null;
        this.keyToRetreive = null;
        this.baseURL = null;
        this.getURL = null;
        this.setURL = null;
        this.httpMethod = "GET";
        this.extraParams = null;
        this.callbacks = [];
        this.isDownloaded = false;
        this.objects = [];
        this.entityName = name;
        this.keyToRetreive = keyToRetreive;
        this.baseURL = baseURL;
        this.getURL = getCommand;
        this.setURL = setCommand;
        if (httpMethod != null)
            this.httpMethod = httpMethod;
        this.extraParams = extraParams;
    }
    MIOEntity.prototype.setCallback = function (target, callback) {
        var item = { "target": target, "function": callback, "updated": false };
        this.callbacks.push(item);
    };
    MIOEntity.prototype.removeCallback = function (target, callback) {
        var pos = -1;
        for (var index = 0; index < this.callbacks.length; index++) {
            var item = this.callbacks[index];
            if (item["target"] === target && item["function"] === callback) {
                pos = index;
                break;
            }
        }
        if (pos > -1)
            this.callbacks.splice(pos, 1);
    };
    MIOEntity.prototype.execute = function () {
        if (this.isDownloaded == false) {
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
    };
    MIOEntity.prototype.setObjects = function (items) {
        this.objects = [];
        for (var count = 0; count < items.length; count++) {
            var item = items[count];
            var obj = MIOClassFromString(this.entityName);
            obj.initWithJSObject(item);
            this.objects.push(obj);
        }
        this.isDownloaded = true;
    };
    MIOEntity.prototype.checkCallbacks = function () {
        if (this.isDownloaded == false)
            return;
        for (var index = 0; index < this.callbacks.length; index++) {
            var item = this.callbacks[index];
            var target = item["target"];
            var callback = item["function"];
            var updated = item["updated"];
            if (updated == false) {
                callback.call(target, this.objects);
            }
        }
    };
    return MIOEntity;
}());
var MIOManagedObject = (function (_super) {
    __extends(MIOManagedObject, _super);
    function MIOManagedObject() {
        _super.apply(this, arguments);
    }
    MIOManagedObject.prototype.initWithJSObject = function (obj) {
    };
    MIOManagedObject.prototype.getJSObject = function () {
        return "";
    };
    return MIOManagedObject;
}(MIOObject));
var MIOManagedObjectContext = (function (_super) {
    __extends(MIOManagedObjectContext, _super);
    function MIOManagedObjectContext() {
        _super.apply(this, arguments);
        this.entities = {};
    }
    MIOManagedObjectContext.prototype.setEntity = function (entity) {
        this.entities[entity.entityName] = entity;
    };
    MIOManagedObjectContext.prototype.executeFetch = function (request, target, callback) {
        var e = this.entities[request.entityName];
        e.setCallback(target, callback);
        return e.execute();
    };
    MIOManagedObjectContext.prototype.removeFetch = function (request, target, callback) {
        var e = this.entities[request.entityName];
        e.removeCallback(target, callback);
    };
    return MIOManagedObjectContext;
}(MIOObject));
//# sourceMappingURL=MIOManagedObjectContext.js.map