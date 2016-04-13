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
    function MIOEntity(name, url) {
        this.entityName = null;
        this.url = null;
        this.callbacks = [];
        this.isDownloaded = false;
        this.objects = null;
        this.entityName = name;
        this.url = url;
    }
    MIOEntity.prototype.setCallback = function (target, callback) {
        var item = { "target": target, "function": callback, "updated": false };
        this.callbacks.push(item);
    };
    MIOEntity.prototype.execute = function () {
        if (this.isDownloaded == false) {
            var urlConnection = new MIOURLConnection();
            var instance = this;
            urlConnection.initWithRequestBlock(new MIOURLRequest(this.url), function (error, data) {
                if (error == false) {
                    var json = JSON.parse(data.replace(/(\r\n|\n|\r)/gm, ""));
                    instance.setObjects(json["elements"]);
                    instance.checkCallbacks();
                }
            });
        }
        else
            this.checkCallbacks();
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
})();
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
})(MIOObject);
var MIOManagedObjectContext = (function (_super) {
    __extends(MIOManagedObjectContext, _super);
    function MIOManagedObjectContext() {
        _super.apply(this, arguments);
        this.entities = {};
    }
    MIOManagedObjectContext.prototype.setEntity = function (entityName, url) {
        var e = new MIOEntity(entityName, url);
        this.entities[entityName] = e;
    };
    MIOManagedObjectContext.prototype.executeFetch = function (request, target, callback) {
        var e = this.entities[request.entityName];
        e.setCallback(target, callback);
        e.execute();
    };
    return MIOManagedObjectContext;
})(MIOObject);
//# sourceMappingURL=MIOManagedObjectContext.js.map