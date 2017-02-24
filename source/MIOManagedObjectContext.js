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
/// <reference path="MIOSortDescriptor.ts" />
var MIOFetchRequest = (function (_super) {
    __extends(MIOFetchRequest, _super);
    function MIOFetchRequest() {
        _super.apply(this, arguments);
        this.entityName = null;
        this.predicate = null;
        this.sortDescriptors = null;
    }
    MIOFetchRequest.fetchRequestWithEntityName = function (name) {
        var fetch = new MIOFetchRequest();
        fetch.initWithEntityName(name);
        return fetch;
    };
    MIOFetchRequest.prototype.initWithEntityName = function (name) {
        this.entityName = name;
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
        this.managedObjectContext = null;
        this._trackChanges = {};
    }
    MIOManagedObject.prototype.setValue = function (propertyName, value) {
        var oldValue = this.getValue(propertyName); //this[propertyName];
        if (oldValue != value) {
            this._trackChanges[propertyName] = value;
            if (this.managedObjectContext != null)
                this.managedObjectContext.updateObject(this);
        }
    };
    MIOManagedObject.prototype.getValue = function (propertyName) {
        var value = this._trackChanges[propertyName];
        if (value == null)
            value = this[propertyName];
        return value;
    };
    Object.defineProperty(MIOManagedObject.prototype, "hasChanges", {
        get: function () {
            return (Object.keys(this._trackChanges).length > 0);
        },
        enumerable: true,
        configurable: true
    });
    MIOManagedObject.prototype.getChanges = function () {
        return this._trackChanges;
    };
    MIOManagedObject.prototype.saveChanges = function () {
        for (var propertyName in this._trackChanges) {
            this[propertyName] = this._trackChanges[propertyName];
        }
        this._trackChanges = {};
    };
    MIOManagedObject.prototype.discardChanges = function () {
        this._trackChanges = {};
    };
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
        obj.managedObjectContext = this;
        this.insertNewObject(obj);
        return obj;
    };
    MIOManagedObjectContext.prototype.insertNewObject = function (obj) {
        obj.saveChanges();
        var entityName = obj.entityName;
        var array = this._insertedObjects[entityName];
        if (array == null) {
            array = [];
            array.push(obj);
            this._insertedObjects[entityName] = array;
        }
        else {
            array.push(obj);
        }
    };
    MIOManagedObjectContext.prototype.updateObject = function (obj) {
        //obj.saveChanges();
        var entityName = obj.entityName;
        var array = this._updateObjects[entityName];
        if (array == null) {
            array = [];
            array.push(obj);
            this._updateObjects[entityName] = array;
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
        objs = this._filterObjects(objs, request.predicate);
        objs = this._sortObjects(objs, request.sortDescriptors);
        return objs;
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
    MIOManagedObjectContext.prototype._sortObjects = function (objs, sortDescriptors) {
        if (sortDescriptors == null)
            return objs;
        var instance = this;
        var resultObjects = objs.sort(function (a, b) {
            return instance._sortObjects2(a, b, sortDescriptors, 0);
        });
        return resultObjects;
    };
    MIOManagedObjectContext.prototype._sortObjects2 = function (a, b, sortDescriptors, index) {
        if (index >= sortDescriptors.length)
            return 0;
        var sd = sortDescriptors[index];
        var key = sd.key;
        if (a[key] == b[key]) {
            if (a[key] == b[key]) {
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
            MIONotificationCenter.defaultCenter().postNotification("MIO" + key, objs, "INSERTED");
        }
        // Clear array
        this._insertedObjects = [];
        // Update objects
        for (var key in this._updateObjects) {
            var objs = this._updateObjects[key];
            // save changes
            for (var i = 0; i < objs.length; i++) {
                var o = objs[i];
                o.saveChanges();
            }
            MIONotificationCenter.defaultCenter().postNotification("MIO" + key, objs, "UPDATED");
        }
        // Clear array
        this._updateObjects = [];
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
