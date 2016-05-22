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
var MIOEntityDescription = (function (_super) {
    __extends(MIOEntityDescription, _super);
    function MIOEntityDescription() {
        _super.apply(this, arguments);
        this.entityName = null;
    }
    MIOEntityDescription.insertNewObjectForEntityForName = function (entityName, context) {
        var object = context.insertNewObjectForEntityName(entityName);
        return object;
    };
    return MIOEntityDescription;
})(MIOObject);
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
        this.objects = {};
        this._persistentStoreCoordinator = null;
    }
    MIOManagedObjectContext.prototype.insertNewObjectForEntityName = function (entityName) {
        var obj = MIOClassFromString(entityName);
        var array = this.objects[entityName];
        if (array == null) {
            array = [];
            this.objects[entityName] = array;
        }
        array.push(obj);
        return obj;
    };
    MIOManagedObjectContext.prototype.setPersistentStoreCoordinator = function (coordinator) {
    };
    MIOManagedObjectContext.prototype.executeFetch = function (request) {
        var objs = this.objects[request.entityName];
        return objs;
    };
    return MIOManagedObjectContext;
})(MIOObject);
var MIOManagedObjectModel = (function (_super) {
    __extends(MIOManagedObjectModel, _super);
    function MIOManagedObjectModel() {
        _super.apply(this, arguments);
    }
    return MIOManagedObjectModel;
})(MIOObject);
var MIOPersistentStoreCoordinator = (function (_super) {
    __extends(MIOPersistentStoreCoordinator, _super);
    function MIOPersistentStoreCoordinator() {
        _super.apply(this, arguments);
        this._managedObjectModel = null;
    }
    Object.defineProperty(MIOPersistentStoreCoordinator.prototype, "managedObjectModel", {
        get: function () {
            if (this._managedObjectModel != null)
                return this._managedObjectModel;
            return this._managedObjectModel;
        },
        enumerable: true,
        configurable: true
    });
    return MIOPersistentStoreCoordinator;
})(MIOObject);
var MIOPersistentStore = (function (_super) {
    __extends(MIOPersistentStore, _super);
    function MIOPersistentStore() {
        _super.apply(this, arguments);
    }
    return MIOPersistentStore;
})(MIOObject);
//# sourceMappingURL=MIOManagedObjectContext.js.map