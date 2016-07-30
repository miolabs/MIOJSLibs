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
/// <reference path="MIONotificationCenter.ts" />
/// <reference path="MIOPredicate.ts" />
var MIOFetchRequest = (function (_super) {
    __extends(MIOFetchRequest, _super);
    function MIOFetchRequest() {
        _super.apply(this, arguments);
        this.entityName = null;
        this.predicate = null;
    }
    MIOFetchRequest.fetchRequestWithEntityName = function (name) {
        var fetch = new MIOFetchRequest();
        fetch.initWithEntityName(name);
        return fetch;
    };
    MIOFetchRequest.prototype.initWithEntityName = function (name) {
        this.entityName = name;
    };
    MIOFetchRequest.prototype.setPredicate = function (predicate) {
        this.predicate = predicate;
    };
    return MIOFetchRequest;
}(MIOObject));
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
}(MIOObject));
var MIOManagedObject = (function (_super) {
    __extends(MIOManagedObject, _super);
    function MIOManagedObject() {
        _super.apply(this, arguments);
        this.entityName = null;
    }
    return MIOManagedObject;
}(MIOObject));
var MIOManagedObjectContext = (function (_super) {
    __extends(MIOManagedObjectContext, _super);
    function MIOManagedObjectContext() {
        _super.apply(this, arguments);
        this._objects = {};
        this._insertedObjects = {};
        this._deletedObjects = {};
        this._updateObjects = {};
        this._persistentStoreCoordinator = null;
    }
    MIOManagedObjectContext.prototype.insertNewObjectForEntityName = function (entityName) {
        var obj = MIOClassFromString(entityName);
        obj.entityName = entityName;
        this.insertNewObject(obj);
        return obj;
    };
    MIOManagedObjectContext.prototype.insertNewObject = function (obj) {
        var entityName = obj.entityName;
        var array = this._insertedObjects[entityName];
        if (array == null) {
            array = [];
            this._insertedObjects[entityName] = array;
        }
        array.push(obj);
    };
    MIOManagedObjectContext.prototype.updateObject = function (obj) {
        var entityName = obj.entityName;
        var array = this._insertedObjects[entityName];
        if (array == null) {
            array = [];
            this._updateObjects[entityName] = array;
            array.push(obj);
        }
        else {
            var index = array.indexOf(obj);
            if (index == -1)
                array.push(obj);
        }
    };
    MIOManagedObjectContext.prototype.removeAllObjectsForEntityName = function (entityName) {
        var objs = this._objects[entityName];
        if (objs != null)
            objs.length = 0;
    };
    MIOManagedObjectContext.prototype.executeFetch = function (request) {
        var objs = this._objects[request.entityName];
        var resultObjs = this._filterObjects(objs, request.predicate);
        return resultObjs;
    };
    MIOManagedObjectContext.prototype._filterObjects = function (objs, predicate) {
        if (objs == null)
            return [];
        var resultObjects = null;
        if (predicate == null)
            resultObjects = objs;
        else {
            resultObjects = objs.filter(function (obj) {
                var result = predicate.evaluateObject(obj);
                if (result)
                    return obj;
            });
        }
        return resultObjects;
    };
    MIOManagedObjectContext.prototype.saveContext = function () {
        // Inserted objects
        for (var key in this._insertedObjects) {
            var objs = this._insertedObjects[key];
            var array = this._objects[key];
            if (array == null) {
                array = [];
                this._objects[key] = array;
            }
            array.push.apply(array, objs);
            // Clear array
            this._insertedObjects = [];
            MIONotificationCenter.defaultCenter().postNotification("MIO" + key, objs, "INSERTED");
        }
        // Update objects
        for (var key in this._updateObjects) {
            var objs = this._updateObjects[key];
            // Clear array
            this._updateObjects = [];
            MIONotificationCenter.defaultCenter().postNotification("MIO" + key, objs, "UPDATED");
        }
    };
    MIOManagedObjectContext.prototype.queryObject = function (entityName, predicateFormat) {
        var request = MIOFetchRequest.fetchRequestWithEntityName(entityName);
        if (predicateFormat != null)
            request.predicate = MIOPredicate.predicateWithFormat(predicateFormat);
        return this.executeFetch(request);
    };
    MIOManagedObjectContext.prototype.setPersistentStoreCoordinator = function (coordinator) {
    };
    return MIOManagedObjectContext;
}(MIOObject));
var MIOManagedObjectModel = (function (_super) {
    __extends(MIOManagedObjectModel, _super);
    function MIOManagedObjectModel() {
        _super.apply(this, arguments);
    }
    return MIOManagedObjectModel;
}(MIOObject));
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
}(MIOObject));
var MIOPersistentStore = (function (_super) {
    __extends(MIOPersistentStore, _super);
    function MIOPersistentStore() {
        _super.apply(this, arguments);
    }
    return MIOPersistentStore;
}(MIOObject));
//# sourceMappingURL=MIOManagedObjectContext.js.map