var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var MIOPropertyDescription = (function (_super) {
    __extends(MIOPropertyDescription, _super);
    function MIOPropertyDescription() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.entity = null;
        _this.name = null;
        _this.optional = true;
        return _this;
    }
    return MIOPropertyDescription;
}(MIOObject));
var MIOAttributeType;
(function (MIOAttributeType) {
    MIOAttributeType[MIOAttributeType["Undefined"] = 0] = "Undefined";
    MIOAttributeType[MIOAttributeType["Boolean"] = 1] = "Boolean";
    MIOAttributeType[MIOAttributeType["Integer"] = 2] = "Integer";
    MIOAttributeType[MIOAttributeType["Float"] = 3] = "Float";
    MIOAttributeType[MIOAttributeType["Number"] = 4] = "Number";
    MIOAttributeType[MIOAttributeType["String"] = 5] = "String";
    MIOAttributeType[MIOAttributeType["Date"] = 6] = "Date";
})(MIOAttributeType || (MIOAttributeType = {}));
var MIOAttributeDescription = (function (_super) {
    __extends(MIOAttributeDescription, _super);
    function MIOAttributeDescription() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._attributeType = MIOAttributeType.Undefined;
        _this._defaultValue = null;
        _this._serverName = null;
        _this._syncable = true;
        return _this;
    }
    MIOAttributeDescription.prototype.initWithName = function (name, type, defaultValue, optional, serverName, syncable) {
        _super.prototype.init.call(this);
        this.name = name;
        this._attributeType = type;
        this._defaultValue = defaultValue;
        this._serverName = serverName;
        this.optional = optional;
        if (syncable == false)
            this._syncable = false;
    };
    Object.defineProperty(MIOAttributeDescription.prototype, "attributeType", {
        get: function () {
            return this._attributeType;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOAttributeDescription.prototype, "defaultValue", {
        get: function () {
            return this._defaultValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOAttributeDescription.prototype, "serverName", {
        get: function () {
            if (this._serverName == null) {
                return this.name;
            }
            return this._serverName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOAttributeDescription.prototype, "syncable", {
        get: function () {
            return this._syncable;
        },
        enumerable: true,
        configurable: true
    });
    return MIOAttributeDescription;
}(MIOPropertyDescription));
var MIODeleteRule;
(function (MIODeleteRule) {
    MIODeleteRule[MIODeleteRule["noActionDeleteRule"] = 0] = "noActionDeleteRule";
    MIODeleteRule[MIODeleteRule["nullifyDeleteRule"] = 1] = "nullifyDeleteRule";
    MIODeleteRule[MIODeleteRule["cascadeDeleteRule"] = 2] = "cascadeDeleteRule";
    MIODeleteRule[MIODeleteRule["denyDeleteRule"] = 3] = "denyDeleteRule";
})(MIODeleteRule || (MIODeleteRule = {}));
var MIORelationshipDescription = (function (_super) {
    __extends(MIORelationshipDescription, _super);
    function MIORelationshipDescription() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.destinationEntityName = null;
        _this.destinationEntity = null;
        _this.inverseRelationship = null;
        _this.isToMany = false;
        _this.deleteRule = MIODeleteRule.noActionDeleteRule;
        _this._serverName = null;
        return _this;
    }
    MIORelationshipDescription.prototype.initWithName = function (name, destinationEntityName, isToMany, serverName, inverseName, inverseEntity) {
        this.init();
        this.name = name;
        this.destinationEntityName = destinationEntityName;
        this.isToMany = isToMany;
        if (serverName != null)
            this._serverName = serverName;
        if (inverseName != null && inverseEntity != null) {
            var ir = new MIORelationshipDescription();
            ir.initWithName(inverseName, inverseEntity, false);
            this.inverseRelationship = ir;
        }
    };
    Object.defineProperty(MIORelationshipDescription.prototype, "serverName", {
        get: function () {
            if (this._serverName == null) {
                return this.name;
            }
            return this._serverName;
        },
        enumerable: true,
        configurable: true
    });
    return MIORelationshipDescription;
}(MIOPropertyDescription));
var MIOEntityDescription = (function (_super) {
    __extends(MIOEntityDescription, _super);
    function MIOEntityDescription() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = null;
        _this.attributes = [];
        _this.attributesByName = {};
        _this.relationships = [];
        _this.relationshipsByName = {};
        _this._properties = [];
        _this._propertiesByName = {};
        _this.serverAttributes = {};
        _this.serverRelationships = {};
        _this._managedObjectClassName = "MIOEntityDescription";
        return _this;
    }
    Object.defineProperty(MIOEntityDescription.prototype, "managedObjectClassName", {
        get: function () { return this._managedObjectClassName; },
        enumerable: true,
        configurable: true
    });
    MIOEntityDescription.entityForNameInManagedObjectContext = function (entityName, context) {
        var entity = MIOManagedObjectModel.entityForNameInManagedObjectContext(entityName, context);
        return entity;
    };
    MIOEntityDescription.insertNewObjectForEntityForName = function (entityName, context) {
        var entity = MIOManagedObjectModel.entityForNameInManagedObjectContext(entityName, context);
        var obj = MIOClassFromString(entityName);
        obj.initWithEntityAndInsertIntoManagedObjectContext(entity, context);
        return obj;
    };
    MIOEntityDescription.prototype.initWithEntityName = function (entityName) {
        _super.prototype.init.call(this);
        this.name = entityName;
        this._managedObjectClassName = entityName;
    };
    Object.defineProperty(MIOEntityDescription.prototype, "properties", {
        get: function () {
            return this._properties;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOEntityDescription.prototype, "propertiesByName", {
        get: function () {
            return this._propertiesByName;
        },
        enumerable: true,
        configurable: true
    });
    MIOEntityDescription.prototype.addAttribute = function (name, type, defaultValue, optional, serverName, syncable) {
        var attr = new MIOAttributeDescription();
        attr.initWithName(name, type, defaultValue, optional, serverName, syncable);
        this.attributes.push(attr);
        this.attributesByName[name] = attr;
        this._propertiesByName[name] = attr;
        this._properties.addObject(attr);
        this.serverAttributes[name] = serverName ? serverName : name;
    };
    MIOEntityDescription.prototype.serverAttributeName = function (name) {
        return this.serverAttributes[name];
    };
    MIOEntityDescription.prototype.addRelationship = function (name, destinationEntityName, toMany, serverName, inverseName, inverseEntity) {
        var rel = new MIORelationshipDescription();
        rel.initWithName(name, destinationEntityName, toMany, serverName, inverseName, inverseEntity);
        this.relationships.push(rel);
        this.relationshipsByName[name] = rel;
        this._propertiesByName[name] = rel;
        this._properties.addObject(rel);
        this.serverRelationships[name] = serverName ? serverName : name;
    };
    MIOEntityDescription.prototype.serverRelationshipName = function (name) {
        return this.serverRelationships[name];
    };
    return MIOEntityDescription;
}(MIOObject));
var MIORequestType;
(function (MIORequestType) {
    MIORequestType[MIORequestType["Fetch"] = 0] = "Fetch";
    MIORequestType[MIORequestType["Save"] = 1] = "Save";
})(MIORequestType || (MIORequestType = {}));
var MIOPersistentStoreRequest = (function (_super) {
    __extends(MIOPersistentStoreRequest, _super);
    function MIOPersistentStoreRequest() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MIOPersistentStoreRequest;
}(MIOObject));
var MIOFetchRequestResultType;
(function (MIOFetchRequestResultType) {
    MIOFetchRequestResultType[MIOFetchRequestResultType["MIOManagedObject"] = 0] = "MIOManagedObject";
    MIOFetchRequestResultType[MIOFetchRequestResultType["MIOManagedObjectID"] = 1] = "MIOManagedObjectID";
    MIOFetchRequestResultType[MIOFetchRequestResultType["Dictionary"] = 2] = "Dictionary";
    MIOFetchRequestResultType[MIOFetchRequestResultType["Count"] = 3] = "Count";
})(MIOFetchRequestResultType || (MIOFetchRequestResultType = {}));
var MIOFetchRequest = (function (_super) {
    __extends(MIOFetchRequest, _super);
    function MIOFetchRequest() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.entityName = null;
        _this.entity = null;
        _this.predicate = null;
        _this.sortDescriptors = null;
        _this.resultType = MIOFetchRequestResultType.MIOManagedObject;
        _this.fetchLimit = 0;
        _this.fetchOffset = 0;
        _this.relationshipKeyPathsForPrefetching = [];
        return _this;
    }
    MIOFetchRequest.fetchRequestWithEntityName = function (entityName) {
        var fetch = new MIOFetchRequest();
        fetch.initWithEntityName(entityName);
        return fetch;
    };
    MIOFetchRequest.prototype.initWithEntityName = function (entityName) {
        this.entityName = entityName;
        this.requestType = MIORequestType.Fetch;
    };
    return MIOFetchRequest;
}(MIOPersistentStoreRequest));
var MIOManagedObjectID = (function (_super) {
    __extends(MIOManagedObjectID, _super);
    function MIOManagedObjectID() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._entity = null;
        _this._isTemporaryID = false;
        _this._persistentStore = null;
        _this._storeIdentifier = null;
        _this._referenceObject = null;
        return _this;
    }
    Object.defineProperty(MIOManagedObjectID.prototype, "entity", {
        get: function () { return this._entity; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOManagedObjectID.prototype, "isTemporaryID", {
        get: function () { return this._isTemporaryID; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOManagedObjectID.prototype, "persistentStore", {
        get: function () { return this._persistentStore; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOManagedObjectID.prototype, "URIRepresentation", {
        get: function () {
            var path = this.entity.name.stringByAppendingPathComponent(this._referenceObject);
            var host = this._isTemporaryID ? "" : this._storeIdentifier;
            var url = new MIOURL();
            url.initWithScheme("x-coredata", host, path);
            return url;
        },
        enumerable: true,
        configurable: true
    });
    MIOManagedObjectID._objectIDWithEntity = function (entity, referenceObject) {
        var objID = new MIOManagedObjectID();
        objID._initWithEntity(entity, referenceObject);
        return objID;
    };
    MIOManagedObjectID._objectIDWithURIRepresentation = function (url) {
        var objID = new MIOManagedObjectID();
        objID._initWithURIRepresentation(url);
        return objID;
    };
    MIOManagedObjectID.prototype._initWithEntity = function (entity, referenceObject) {
        _super.prototype.init.call(this);
        this._entity = entity;
        if (referenceObject == null) {
            this._isTemporaryID = true;
            this._referenceObject = MIOUUID.uuid();
        }
        else {
            this._setReferenceObject(referenceObject);
            MIOLog("ManagedObjectID create " + entity.name + "/" + referenceObject);
        }
    };
    MIOManagedObjectID.prototype._initWithURIRepresentation = function (url) {
        _super.prototype.init.call(this);
    };
    MIOManagedObjectID.prototype._getStoreIdentifier = function () { return this._storeIdentifier; };
    MIOManagedObjectID.prototype._setStoreIdentifier = function (identifier) { this._storeIdentifier = identifier; };
    MIOManagedObjectID.prototype._setPersistentStore = function (persistentStore) { this._persistentStore = persistentStore; };
    MIOManagedObjectID.prototype._getReferenceObject = function () { return this._referenceObject; };
    MIOManagedObjectID.prototype._setReferenceObject = function (object) {
        this._isTemporaryID = false;
        this._referenceObject = object;
        if (typeof (object) != "string") {
            MIOLog("kkk");
        }
    };
    return MIOManagedObjectID;
}(MIOObject));
var MIOManagedObjectSet = (function (_super) {
    __extends(MIOManagedObjectSet, _super);
    function MIOManagedObjectSet() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.mo = null;
        _this.relationship = null;
        _this.objectIDs = [];
        _this.relationshipFault = true;
        _this.objects = null;
        return _this;
    }
    MIOManagedObjectSet._setWithManagedObject = function (object, relationship) {
        var mos = new MIOManagedObjectSet();
        mos._initWithManagedObject(object, relationship);
        return mos;
    };
    MIOManagedObjectSet.prototype.init = function () {
        throw ("MIOManagedObjectSet: Can't initialize an MIOManagedObjectSet with -init");
    };
    MIOManagedObjectSet.prototype._initWithManagedObject = function (object, relationship) {
        _super.prototype.init.call(this);
        this.mo = object;
        this.relationship = relationship;
    };
    MIOManagedObjectSet.prototype._addObjectID = function (objectID) {
        if (this.objectIDs.containsObject(objectID) == true)
            return;
        this.objectIDs.addObject(objectID);
        this.relationshipFault = true;
    };
    MIOManagedObjectSet.prototype.addObject = function (object) {
        this._addObjectID(object.objectID);
    };
    MIOManagedObjectSet.prototype._removeObject = function (objectID) {
        if (this.objectIDs.containsObject(objectID) == false)
            return;
        this.objectIDs.removeObject(objectID);
        this.relationshipFault = true;
    };
    MIOManagedObjectSet.prototype.removeObject = function (object) {
        this._removeObject(object.objectID);
    };
    MIOManagedObjectSet.prototype.removeAllObjects = function () {
        this.objectIDs = [];
    };
    MIOManagedObjectSet.prototype.indexOfObject = function (object) {
        return this.objectIDs.indexOfObject(object.objectID);
    };
    MIOManagedObjectSet.prototype.containsObject = function (object) {
        return this.objectIDs.indexOfObject(object.objectID) > -1 ? true : false;
    };
    MIOManagedObjectSet.prototype.objectAtIndex = function (index) {
        var objects = this.allObjects;
        return objects.objectAtIndex(index);
    };
    Object.defineProperty(MIOManagedObjectSet.prototype, "allObjects", {
        get: function () {
            if (this.relationshipFault == false) {
                return this.objects;
            }
            this.objects = [];
            this.relationshipFault = false;
            for (var index = 0; index < this.objectIDs.length; index++) {
                var objID = this.objectIDs[index];
                var obj = this.mo.managedObjectContext.objectWithID(objID);
                this.objects.addObject(obj);
            }
            return this.objects;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOManagedObjectSet.prototype, "count", {
        get: function () {
            return this.objectIDs.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOManagedObjectSet.prototype, "length", {
        get: function () {
            return this.count;
        },
        enumerable: true,
        configurable: true
    });
    MIOManagedObjectSet.prototype.filterWithPredicate = function (predicate) {
        var objs = _MIOPredicateFilterObjects(this.allObjects, predicate);
        return objs;
    };
    MIOManagedObjectSet.prototype.addObserver = function (obs, keypath, context) {
        if (keypath == "count" || keypath == "length")
            throw "MIOSet: Can't observe count. It's not KVO Compilant";
        _super.prototype.addObserver.call(this, obs, keypath, context);
    };
    MIOManagedObjectSet.prototype._reset = function () {
        this.relationshipFault = true;
        this.objects = [];
        this.objectIDs = [];
    };
    return MIOManagedObjectSet;
}(MIOObject));
var MIOManagedObject = (function (_super) {
    __extends(MIOManagedObject, _super);
    function MIOManagedObject() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._objectID = null;
        _this._managedObjectContext = null;
        _this._isInserted = false;
        _this._isUpdated = false;
        _this._isDeleted = false;
        _this._isFault = false;
        _this._version = 0;
        _this._changedValues = {};
        _this._storedValues = null;
        return _this;
    }
    MIOManagedObject.prototype.init = function () {
        throw ("MIOManagedObject: Can't initialize an MIOManagedObject with -init");
    };
    MIOManagedObject.prototype._initWithObjectID = function (objectID, context) {
        this._objectID = objectID;
        this._managedObjectContext = context;
        this._isFault = true;
        this._storedValues = null;
        this.awakeFromFetch();
    };
    MIOManagedObject.prototype.initWithEntityAndInsertIntoManagedObjectContext = function (entity, context) {
        var objectID = MIOManagedObjectID._objectIDWithEntity(entity);
        this._initWithObjectID(objectID, context);
        context.insertObject(this);
        this.setDefaultValues();
        this.awakeFromInsert();
    };
    MIOManagedObject.prototype.setDefaultValues = function () {
        var attributes = this.entity.attributesByName;
        for (var key in attributes) {
            var attr = attributes[key];
            var value = attr.defaultValue;
            if (value == null)
                continue;
            this.setValueForKey(value, key);
        }
    };
    Object.defineProperty(MIOManagedObject.prototype, "objectID", {
        get: function () { return this._objectID; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOManagedObject.prototype, "entity", {
        get: function () { return this.objectID.entity; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOManagedObject.prototype, "managedObjectContext", {
        get: function () { return this._managedObjectContext; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOManagedObject.prototype, "hasChanges", {
        get: function () { return (this._isInserted || this._isUpdated || this._isDeleted); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOManagedObject.prototype, "isInserted", {
        get: function () { return this._isInserted; },
        enumerable: true,
        configurable: true
    });
    MIOManagedObject.prototype._setIsInserted = function (value) {
        this.willChangeValue("hasChanges");
        this.willChangeValue("isInserted");
        this._isInserted = value;
        this.didChangeValue("isInserted");
        this.didChangeValue("hasChanges");
    };
    Object.defineProperty(MIOManagedObject.prototype, "isUpdated", {
        get: function () { return this._isUpdated; },
        enumerable: true,
        configurable: true
    });
    MIOManagedObject.prototype._setIsUpdated = function (value) {
        this.willChangeValue("hasChanges");
        this.willChangeValue("isUpdated");
        this._isUpdated = value;
        this.didChangeValue("isUpdated");
        this.didChangeValue("hasChanges");
    };
    Object.defineProperty(MIOManagedObject.prototype, "isDeleted", {
        get: function () { return this._isDeleted; },
        enumerable: true,
        configurable: true
    });
    MIOManagedObject.prototype._setIsDeleted = function (value) {
        this.willChangeValue("hasChanges");
        this.willChangeValue("isDeleted");
        this._isDeleted = value;
        this.didChangeValue("isDeleted");
        this.didChangeValue("hasChanges");
    };
    Object.defineProperty(MIOManagedObject.prototype, "isFault", {
        get: function () { return this._isFault; },
        enumerable: true,
        configurable: true
    });
    MIOManagedObject.prototype._setIsFault = function (value) {
        if (value == this._isFault)
            return;
        this.willChangeValue("hasChanges");
        this.willChangeValue("isFault");
        this._isFault = value;
        if (value == true)
            this._storedValues = null;
        this.didChangeValue("isFault");
        this.didChangeValue("hasChanges");
    };
    MIOManagedObject.prototype.awakeFromInsert = function () { };
    MIOManagedObject.prototype.awakeFromFetch = function () { };
    Object.defineProperty(MIOManagedObject.prototype, "changedValues", {
        get: function () { return this._changedValues; },
        enumerable: true,
        configurable: true
    });
    MIOManagedObject.prototype.committedValues = function () {
        if (this.objectID.isTemporaryID == true)
            return {};
        if (this._storedValues == null) {
            if (this.objectID.persistentStore instanceof MIOIncrementalStore) {
                this._storedValues = this.storeValuesFromIncrementalStore(this.objectID.persistentStore);
            }
            else {
                throw ("MIOManagedObject: Only Incremental store is supported.");
            }
            this._setIsFault(false);
        }
        return this._storedValues;
    };
    MIOManagedObject.prototype.storeValuesFromIncrementalStore = function (store) {
        var storedValues = {};
        var properties = this.entity.properties;
        for (var index = 0; index < properties.length; index++) {
            var property = properties[index];
            if (property instanceof MIOAttributeDescription) {
                var attribute = property;
                var node_1 = store.newValuesForObjectWithID(this.objectID, this.managedObjectContext);
                var value = node_1.valueForPropertyDescription(attribute);
                storedValues[attribute.name] = value;
            }
            else if (property instanceof MIORelationshipDescription) {
                var relationship = property;
                if (relationship.isToMany == false) {
                    var objectID = store.newValueForRelationship(relationship, this.objectID, this.managedObjectContext);
                    if (objectID != null) {
                        storedValues[relationship.name] = objectID;
                    }
                }
                else {
                    var set = MIOManagedObjectSet._setWithManagedObject(this, relationship);
                    var objectIDs = store.newValueForRelationship(relationship, this.objectID, this.managedObjectContext);
                    if (objectIDs == null)
                        continue;
                    for (var index_1 = 0; index_1 < objectIDs.length; index_1++) {
                        var objID = objectIDs[index_1];
                        set._addObjectID(objID);
                    }
                    this["_" + relationship.name] = set;
                }
            }
        }
        var node = store._nodeForObjectID(this.objectID, this.managedObjectContext);
        this._version = node.version;
        return storedValues;
    };
    MIOManagedObject.prototype.committedValuesForKeys = function (keys) {
        var values = this.committedValues();
        if (keys == null)
            return values;
        var result = {};
        for (var key in keys) {
            var obj = values[key];
            if (obj != null)
                result[key] = obj;
        }
        return result;
    };
    MIOManagedObject.prototype.willSave = function () { };
    MIOManagedObject.prototype.didSave = function () { };
    MIOManagedObject.prototype.willTurnIntoFault = function () { };
    MIOManagedObject.prototype.didTurnIntoFault = function () { };
    MIOManagedObject.prototype.willAccessValueForKey = function (key) { };
    ;
    MIOManagedObject.prototype.didAccessValueForKey = function (key) { };
    ;
    MIOManagedObject.prototype.valueForKey = function (key) {
        if (key == null)
            return null;
        var property = this.entity.propertiesByName[key];
        if (property == null) {
            return _super.prototype.valueForKey.call(this, key);
        }
        this.willAccessValueForKey(key);
        var value = null;
        if (property instanceof MIOAttributeDescription) {
            value = this._changedValues[key];
            if (value == null) {
                value = this.primitiveValueForKey(key);
            }
        }
        else if (property instanceof MIORelationshipDescription) {
            var relationship = property;
            if (relationship.isToMany == false) {
                var objID = this._changedValues[key];
                if (objID != null) {
                    value = this.managedObjectContext.objectWithID(objID);
                }
                else {
                    value = this.primitiveValueForKey(key);
                }
            }
            else {
                value = this._changedValues[key];
                if (value == null) {
                    value = this.primitiveValueForKey(key);
                }
            }
        }
        this.didAccessValueForKey(key);
        return value;
    };
    MIOManagedObject.prototype.setValueForKey = function (value, key) {
        var property = this.entity.propertiesByName[key];
        if (property == null) {
            _super.prototype.setValueForKey.call(this, value, key);
            return;
        }
        this.willChangeValueForKey(key);
        if (value == null) {
            this._changedValues[key] = null;
        }
        else if (property instanceof MIORelationshipDescription) {
            var relationship = property;
            if (relationship.isToMany == false) {
                var obj = value;
                this._changedValues[key] = obj.objectID;
            }
            var inverseRelationship = relationship.inverseRelationship;
            if (inverseRelationship != null) {
            }
        }
        else {
            this._changedValues[key] = value;
        }
        this.didChangeValueForKey(key);
        this.managedObjectContext.updateObject(this);
    };
    MIOManagedObject.prototype.primitiveValueForKey = function (key) {
        var property = this.entity.propertiesByName[key];
        var committedValues = this.committedValues();
        if (property instanceof MIORelationshipDescription) {
            var relationship = property;
            if (relationship.isToMany == false) {
                var objID = committedValues[key];
                if (objID == null)
                    return null;
                var obj = this.managedObjectContext.objectWithID(objID);
                return obj;
            }
            else {
                var set = this["_" + relationship.name];
                if (set == null) {
                    set = MIOManagedObjectSet._setWithManagedObject(this, relationship);
                    this["_" + relationship.name] = set;
                }
                return set;
            }
        }
        return committedValues[key];
    };
    MIOManagedObject.prototype.setPrimitiveValueForKey = function (value, key) {
        var property = this.entity.propertiesByName[key];
        var committedValues = this.committedValues();
        if (value == null) {
            committedValues[key] = null;
        }
        else if (property instanceof MIORelationshipDescription) {
            var relationship = property;
            if (relationship.isToMany == false) {
                var obj = value;
                committedValues[key] = obj.objectID;
            }
            else {
                if (value == null) {
                    this["_" + relationship.name] = MIOManagedObjectSet._setWithManagedObject(this, relationship);
                }
                else {
                    if ((value instanceof MIOManagedObjectSet) == false)
                        throw ("MIOManagedObject: Trying to set a value in relation ships that is not a set.");
                    this["_" + relationship.name] = value;
                }
            }
            var inverseRelationship = relationship.inverseRelationship;
            if (inverseRelationship != null) {
            }
        }
        else {
            committedValues[key] = value;
        }
    };
    MIOManagedObject.prototype._addObjectForKey = function (object, key) {
        var set = this.valueForKey(key);
        if (set == null) {
            var rel = this.entity.relationshipsByName[key];
            set = MIOManagedObjectSet._setWithManagedObject(this, rel);
        }
        set.addObject(object);
        this._changedValues[key] = set;
        this.managedObjectContext.updateObject(this);
    };
    MIOManagedObject.prototype._removeObjectForKey = function (object, key) {
        var set = this.valueForKey(key);
        if (set == null) {
            var rel = this.entity.relationshipsByName[key];
            set = MIOManagedObjectSet._setWithManagedObject(this, rel);
        }
        else {
            set.removeObject(object);
        }
        this._changedValues[key] = set;
        this.managedObjectContext.updateObject(this);
    };
    MIOManagedObject.prototype._didCommit = function () {
        this._changedValues = {};
        this._storedValues = null;
        this._setIsFault(false);
    };
    return MIOManagedObject;
}(MIOObject));
var MIOManagedObjectModel = (function (_super) {
    __extends(MIOManagedObjectModel, _super);
    function MIOManagedObjectModel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._entitiesByName = {};
        _this._entitiesByConfigName = {};
        _this.currentEntity = null;
        _this.currentConfigName = null;
        return _this;
    }
    MIOManagedObjectModel.entityForNameInManagedObjectContext = function (entityName, context) {
        var mom = context.persistentStoreCoordinator.managedObjectModel;
        var entity = mom.entitiesByName[entityName];
        if (entity == null) {
            throw ("MIOManagedObjectModel: Unkown entity (" + entityName + ")");
        }
        return entity;
    };
    MIOManagedObjectModel.prototype.initWithContentsOfURL = function (url) {
        var request = MIOURLRequest.requestWithURL(url);
        var uc = new MIOURLConnection();
        uc.initWithRequest(request, this);
    };
    MIOManagedObjectModel.prototype.connectionDidReceiveText = function (urlConnection, text) {
        var parser = new MIOXMLParser();
        parser.initWithString(text, this);
        parser.parse();
    };
    MIOManagedObjectModel.prototype.parserDidStartElement = function (parser, element, attributes) {
        if (element == "entity") {
            var name_1 = attributes["name"];
            this.currentEntity = new MIOEntityDescription();
            this.currentEntity.initWithEntityName(name_1);
        }
        else if (element == "attribute") {
            var name_2 = attributes["name"];
            var type = attributes["attributeType"];
            var serverName = attributes["serverName"];
            var optional = attributes["optional"] != null ? attributes["optional"].toLowerCase() : "yes";
            var optionalValue = optional == "no" ? false : true;
            var syncable = attributes["syncable"];
            var defaultValueString = attributes["defaultValueString"];
            this._addAttribute(name_2, type, optionalValue, serverName, syncable, defaultValueString);
        }
        else if (element == "relationship") {
            var name_3 = attributes["name"];
            var destinationEntityName = attributes["destinationEntity"];
            var toMany = attributes["toMany"];
            var serverName = attributes["serverName"];
            var inverseName = attributes["inverseName"];
            var inverseEntity = attributes["inverseEntity"];
            this._addRelationship(name_3, destinationEntityName, toMany, serverName, inverseName, inverseEntity);
        }
        else if (element == "configuration") {
            this.currentConfigName = attributes["name"];
        }
        else if (element == "memberEntity") {
            var entityName = attributes["name"];
            var entity = this._entitiesByName[entityName];
            this._setEntityForConfiguration(entity, this.currentConfigName);
        }
    };
    MIOManagedObjectModel.prototype.parserDidEndElement = function (parser, element) {
        if (element == "entity") {
            var entity = this.currentEntity;
            this._entitiesByName[entity.managedObjectClassName] = entity;
            this.currentEntity = null;
        }
    };
    MIOManagedObjectModel.prototype.parserDidEndDocument = function (parser) {
        for (var entityName in this._entitiesByName) {
            var e = this._entitiesByName[entityName];
            for (var index = 0; index < e.relationships.length; index++) {
                var r = e.relationships[index];
                if (r.destinationEntity == null) {
                    var de = this._entitiesByName[r.destinationEntityName];
                    r.destinationEntity = de;
                }
            }
        }
    };
    MIOManagedObjectModel.prototype._addAttribute = function (name, type, optional, serverName, syncable, defaultValueString) {
        var attrType = null;
        var defaultValue = null;
        switch (type) {
            case "Boolean":
                attrType = MIOAttributeType.Boolean;
                if (defaultValueString != null)
                    defaultValue = defaultValueString.toLocaleLowerCase() == "true" ? true : false;
                break;
            case "Integer":
                attrType = MIOAttributeType.Integer;
                if (defaultValueString != null)
                    defaultValue = parseInt(defaultValueString);
                break;
            case "Float":
                attrType = MIOAttributeType.Float;
                if (defaultValueString != null)
                    defaultValue = parseFloat(defaultValueString);
                break;
            case "Number":
                attrType = MIOAttributeType.Number;
                if (defaultValueString != null)
                    defaultValue = parseFloat(defaultValueString);
                break;
            case "String":
                attrType = MIOAttributeType.String;
                if (defaultValueString != null)
                    defaultValue = defaultValueString;
                break;
            case "Date":
                attrType = MIOAttributeType.Date;
                if (defaultValueString != null)
                    defaultValue = MIODateFromString(defaultValueString);
                break;
        }
        this.currentEntity.addAttribute(name, attrType, defaultValue, optional, serverName, syncable);
    };
    MIOManagedObjectModel.prototype._addRelationship = function (name, destinationEntityName, toMany, serverName, inverseName, inverseEntity) {
        var isToMany = false;
        if (toMany.toLocaleLowerCase() == "yes" || toMany.toLocaleLowerCase() == "true") {
            isToMany = true;
        }
        this.currentEntity.addRelationship(name, destinationEntityName, isToMany, serverName, inverseName, inverseEntity);
    };
    MIOManagedObjectModel.prototype._setEntityForConfiguration = function (entity, configuration) {
        var array = this.entitiesForConfiguration[configuration];
        if (array == null) {
            array = [];
            this.entitiesForConfiguration[configuration] = array;
        }
        array.addObject(entity);
    };
    MIOManagedObjectModel.prototype.setEntitiesForConfiguration = function (entities, configuration) {
        for (var index = 0; index < entities.length; index++) {
            var entity = entities[index];
            this._setEntityForConfiguration(entity, configuration);
        }
    };
    MIOManagedObjectModel.prototype.entitiesForConfiguration = function (configurationName) {
        return this.entitiesForConfiguration[configurationName];
    };
    Object.defineProperty(MIOManagedObjectModel.prototype, "entitiesByName", {
        get: function () {
            return this._entitiesByName;
        },
        enumerable: true,
        configurable: true
    });
    return MIOManagedObjectModel;
}(MIOObject));
var MIOPersistentStoreCoordinator = (function (_super) {
    __extends(MIOPersistentStoreCoordinator, _super);
    function MIOPersistentStoreCoordinator() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._managedObjectModel = null;
        _this._storesByIdentifier = {};
        _this._stores = [];
        return _this;
    }
    Object.defineProperty(MIOPersistentStoreCoordinator.prototype, "managedObjectModel", {
        get: function () { return this._managedObjectModel; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOPersistentStoreCoordinator.prototype, "persistentStores", {
        get: function () { return this._stores; },
        enumerable: true,
        configurable: true
    });
    MIOPersistentStoreCoordinator.registerStoreClassForStoreType = function (storeClass, storeType) {
        MIOPersistentStoreCoordinator._storeClasses[storeType] = storeClass;
    };
    MIOPersistentStoreCoordinator.prototype.initWithManagedObjectModel = function (model) {
        _super.prototype.init.call(this);
        this._managedObjectModel = model;
    };
    MIOPersistentStoreCoordinator.prototype.addPersistentStoreWithType = function (type, configuration, url, options) {
        if (type == null) {
            throw ("MIOPersistentStoreCoordinator: Unimplemeted method with type null");
        }
        var className = MIOPersistentStoreCoordinator._storeClasses[type];
        if (className == null)
            throw ("MIOPersistentStoreCoordinator: Unkown persistent store type.");
        var ps = MIOClassFromString(className);
        ps.initWithPersistentStoreCoordinator(this, configuration, url, options);
        this._storesByIdentifier[ps.identifier] = ps;
        this._stores.addObject(ps);
        ps.didAddToPersistentStoreCoordinator(this);
        return ps;
    };
    MIOPersistentStoreCoordinator.prototype.removePersistentStore = function (store) {
        store.willRemoveFromPersistentStoreCoordinator(this);
        delete this._storesByIdentifier[store.identifier];
        this._stores.removeObject(store);
    };
    MIOPersistentStoreCoordinator.prototype.managedObjectIDForURIRepresentation = function (url) {
        var scheme = url.scheme;
        var host = url.host;
        var path = url.path;
        var reference = path.lastPathComponent();
        var entityName = path.stringByDeletingLastPathComponent().lastPathComponent();
        var model = this.managedObjectModel;
        var entity = model.entitiesByName[entityName];
        return this._persistentStoreWithIdentifier(host)._objectIDForEntity(entity, reference);
    };
    MIOPersistentStoreCoordinator.prototype._persistentStoreWithIdentifier = function (identifier) {
        if (identifier == null)
            return null;
        return this._storesByIdentifier[identifier];
    };
    MIOPersistentStoreCoordinator.prototype._persistentStoreForObjectID = function (objectID) {
        if (this._stores.length == 0)
            throw ("MIOPersistentStoreCoordinator: There's no stores!");
        var entity = objectID.entity;
        var storeIdentifier = objectID._getStoreIdentifier();
        var store = this._persistentStoreWithIdentifier(storeIdentifier);
        if (store != null)
            return store;
        var model = this.managedObjectModel;
        for (var index = 0; index < this._stores.length; index++) {
            var store_1 = this._stores[index];
            var configurationName = store_1.configurationName;
            if (configurationName != null) {
                var entities = model.entitiesForConfiguration(configurationName);
                for (var name in entities) {
                    var checkEntity = entities[name];
                    if (checkEntity === entity)
                        return checkEntity;
                }
            }
        }
        return this._stores[0];
    };
    MIOPersistentStoreCoordinator.prototype._persistentStoreForObject = function (object) {
        return this._persistentStoreForObjectID(object.objectID);
    };
    MIOPersistentStoreCoordinator._storeClasses = {};
    return MIOPersistentStoreCoordinator;
}(MIOObject));
var MIOStoreUUIDKey = "MIOStoreUUIDKey";
var MIOStoreTypeKey = "MIOStoreTypeKey";
var MIOPersistentStore = (function (_super) {
    __extends(MIOPersistentStore, _super);
    function MIOPersistentStore() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._persistentStoreCoordinator = null;
        _this._configurationName = null;
        _this._url = null;
        _this._options = null;
        _this._type = null;
        _this._identifier = null;
        _this.metadata = null;
        return _this;
    }
    Object.defineProperty(MIOPersistentStore, "type", {
        get: function () { return "MIOPersistentStore"; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOPersistentStore.prototype, "persistentStoreCoordinator", {
        get: function () { return this._persistentStoreCoordinator; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOPersistentStore.prototype, "configurationName", {
        get: function () { return this._configurationName; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOPersistentStore.prototype, "url", {
        get: function () { return this._url; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOPersistentStore.prototype, "options", {
        get: function () { return this._options; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOPersistentStore.prototype, "readOnly", {
        get: function () { return false; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOPersistentStore.prototype, "type", {
        get: function () { return this._type; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOPersistentStore.prototype, "identifier", {
        get: function () { return this._identifier; },
        enumerable: true,
        configurable: true
    });
    MIOPersistentStore.prototype.initWithPersistentStoreCoordinator = function (root, configurationName, url, options) {
        this._persistentStoreCoordinator = root;
        this._configurationName = configurationName;
        this._url = url;
        this._options = options;
        this.loadMetadata();
        this._identifier = this.metadata[MIOStoreUUIDKey];
        this._type = this.metadata[MIOStoreTypeKey];
        if (this._identifier == null || this._type == null) {
            throw ("MIOPersistentStore: Invalid metada information");
        }
    };
    MIOPersistentStore.prototype.didAddToPersistentStoreCoordinator = function (psc) { };
    MIOPersistentStore.prototype.willRemoveFromPersistentStoreCoordinator = function (psc) { };
    MIOPersistentStore.prototype.loadMetadata = function () {
        var uuid = MIOUUID.uuid();
        var metadata = { MIOStoreUUIDKey: uuid, MIOStoreTypeKey: "MIOPersistentStore" };
        this.metadata = metadata;
    };
    MIOPersistentStore.prototype._obtainPermanentIDForObject = function (object) {
        return object.objectID;
    };
    MIOPersistentStore.prototype._executeRequest = function (request, context) {
        return [];
    };
    MIOPersistentStore.prototype._objectIDForEntity = function (entity, referenceObject) {
        return null;
    };
    return MIOPersistentStore;
}(MIOObject));
var MIOManagedObjectContextWillSaveNotification = "MIOManagedObjectContextWillSaveNotification";
var MIOManagedObjectContextDidSaveNotification = "MIOManagedObjectContextDidSaveNotification";
var MIOManagedObjectContextObjectsDidChange = "MIOManagedObjectContextObjectsDidChange";
var MIOInsertedObjectsKey = "MIOInsertedObjectsKey";
var MIOUpdatedObjectsKey = "MIOUpdatedObjectsKey";
var MIODeletedObjectsKey = "MIODeletedObjectsKey";
var MIORefreshedObjectsKey = "MIORefreshedObjectsKey";
var MIOManagedObjectContextConcurrencyType;
(function (MIOManagedObjectContextConcurrencyType) {
    MIOManagedObjectContextConcurrencyType[MIOManagedObjectContextConcurrencyType["PrivateQueue"] = 0] = "PrivateQueue";
    MIOManagedObjectContextConcurrencyType[MIOManagedObjectContextConcurrencyType["MainQueue"] = 1] = "MainQueue";
})(MIOManagedObjectContextConcurrencyType || (MIOManagedObjectContextConcurrencyType = {}));
var NSMergePolicy;
(function (NSMergePolicy) {
    NSMergePolicy[NSMergePolicy["None"] = 0] = "None";
})(NSMergePolicy || (NSMergePolicy = {}));
var MIOManagedObjectContext = (function (_super) {
    __extends(MIOManagedObjectContext, _super);
    function MIOManagedObjectContext() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.persistentStoreCoordinator = null;
        _this.concurrencyType = MIOManagedObjectContextConcurrencyType.MainQueue;
        _this.mergePolicy = "";
        _this._parent = null;
        _this.managedObjectChanges = {};
        _this.objectsByEntity = {};
        _this.objectsByID = {};
        _this.insertedObjects = MIOSet.set();
        _this.updatedObjects = MIOSet.set();
        _this.deletedObjects = MIOSet.set();
        _this.blockChanges = null;
        _this.registerObjects = [];
        return _this;
    }
    MIOManagedObjectContext.prototype.initWithConcurrencyType = function (type) {
        _super.prototype.init.call(this);
        this.concurrencyType = type;
    };
    Object.defineProperty(MIOManagedObjectContext.prototype, "parent", {
        get: function () { return this._parent; },
        set: function (value) {
            this._parent = value;
            if (value != null) {
                this.persistentStoreCoordinator = value.persistentStoreCoordinator;
            }
        },
        enumerable: true,
        configurable: true
    });
    MIOManagedObjectContext.prototype._registerObject = function (object) {
        if (this.objectsByID[object.objectID.URIRepresentation.absoluteString] != null)
            return;
        this.registerObjects.addObject(object);
        this.objectsByID[object.objectID.URIRepresentation.absoluteString] = object;
        var entityName = object.entity.name;
        var array = this.objectsByEntity[entityName];
        if (array == null) {
            array = [];
            this.objectsByEntity[entityName] = array;
        }
        array.addObject(object);
        if (object.objectID.persistentStore instanceof MIOIncrementalStore) {
            var is = object.objectID.persistentStore;
            is.managedObjectContextDidRegisterObjectsWithIDs([object.objectID]);
        }
    };
    MIOManagedObjectContext.prototype._unregisterObject = function (object) {
        this.registerObjects.removeObject(object);
        delete this.objectsByID[object.objectID.URIRepresentation.absoluteString];
        var entityName = object.entity.name;
        var array = this.objectsByEntity[entityName];
        if (array != null) {
            array.removeObject(object);
        }
        if (object.objectID.persistentStore instanceof MIOIncrementalStore) {
            var is = object.objectID.persistentStore;
            is.managedObjectContextDidUnregisterObjectsWithIDs([object.objectID]);
        }
    };
    MIOManagedObjectContext.prototype.insertObject = function (object) {
        var store = this.persistentStoreCoordinator._persistentStoreForObject(object);
        var objectID = object.objectID;
        objectID._setStoreIdentifier(store.identifier);
        objectID._setPersistentStore(store);
        this.insertedObjects.addObject(object);
        this._registerObject(object);
        object._setIsInserted(true);
    };
    MIOManagedObjectContext.prototype.updateObject = function (object) {
        if (this.insertedObjects.containsObject(object))
            return;
        this.updatedObjects.addObject(object);
        object._setIsUpdated(true);
    };
    MIOManagedObjectContext.prototype.deleteObject = function (object) {
        this.insertedObjects.removeObject(object);
        object._setIsInserted(false);
        this.updatedObjects.removeObject(object);
        object._setIsUpdated(false);
        this.deletedObjects.addObject(object);
        object._setIsDeleted(true);
    };
    MIOManagedObjectContext.prototype._objectWithURIRepresentationString = function (urlString) {
        return this.objectsByID[urlString];
    };
    MIOManagedObjectContext.prototype.objectWithID = function (objectID) {
        var obj = this.objectsByID[objectID.URIRepresentation.absoluteString];
        if (obj == null) {
            obj = MIOClassFromString(objectID.entity.name);
            obj._initWithObjectID(objectID, this);
            this._registerObject(obj);
        }
        return obj;
    };
    MIOManagedObjectContext.prototype.existingObjectWithID = function (objectID) {
        var obj = this.objectsByID[objectID.URIRepresentation.absoluteString];
        var store = objectID.persistentStore;
        var node = store._nodeForObjectID(objectID, this);
        if (obj != null && node != null && obj._version < node.version) {
            obj._setIsFault(true);
        }
        else if (obj == null && node != null) {
            obj = MIOClassFromString(objectID.entity.name);
            obj._initWithObjectID(objectID, this);
            this._registerObject(obj);
        }
        return obj;
    };
    MIOManagedObjectContext.prototype.refreshObject = function (object, mergeChanges) {
        if (mergeChanges == false)
            return;
        if (object.isFault == false)
            return;
        var changes = null;
        if (this.blockChanges != null) {
            changes = this.blockChanges;
        }
        else {
            changes = {};
            changes[MIORefreshedObjectsKey] = {};
        }
        var entityName = object.entity.name;
        var objs = changes[MIORefreshedObjectsKey];
        var set = objs[entityName];
        if (set == null) {
            set = MIOSet.set();
            objs[entityName] = set;
        }
        set.addObject(object);
        if (this.blockChanges == null) {
            MIONotificationCenter.defaultCenter().postNotification(MIOManagedObjectContextObjectsDidChange, this, changes);
        }
    };
    MIOManagedObjectContext.prototype.addObjectToTracking = function (objectTracking, object) {
        var array = objectTracking[object.entity.name];
        if (array == null) {
            array = [];
            objectTracking[object.entity.name] = array;
        }
        array.push(object);
    };
    MIOManagedObjectContext.prototype.removeObjectFromTracking = function (objectTracking, object) {
        var array = objectTracking[object.entity.name];
        if (array == null)
            return;
        var index = array.indexOf(object);
        if (index > -1)
            array.splice(index, 1);
    };
    MIOManagedObjectContext.prototype.removeAllObjectsForEntityName = function (entityName) {
        var objs = this.objectsByEntity[entityName];
        if (objs != null) {
            for (var index = objs.length - 1; index >= 0; index--) {
                var o = objs[index];
                this.deleteObject(o);
            }
        }
    };
    MIOManagedObjectContext.prototype.executeFetch = function (request) {
        var entityName = request.entityName;
        var entity = MIOEntityDescription.entityForNameInManagedObjectContext(entityName, this);
        request.entity = entity;
        var store = this.persistentStoreCoordinator.persistentStores[0];
        var objs = store._executeRequest(request, this);
        for (var index = 0; index < objs.length; index++) {
            var o = objs[index];
            this._registerObject(o);
        }
        if (request instanceof MIOFetchRequest) {
            var fetchRequest = request;
            var objects = _MIOPredicateFilterObjects(this.objectsByEntity[entityName], fetchRequest.predicate);
            objects = _MIOSortDescriptorSortObjects(objects, fetchRequest.sortDescriptors);
            return objects;
        }
        return [];
    };
    MIOManagedObjectContext.prototype._obtainPermanentIDForObject = function (object) {
        var store = object.objectID.persistentStore;
        var objID = store._obtainPermanentIDForObject(object);
        delete this.objectsByID[object.objectID.URIRepresentation.absoluteString];
        object.objectID._setReferenceObject(objID._getReferenceObject());
        this.objectsByID[object.objectID.URIRepresentation.absoluteString] = object;
    };
    MIOManagedObjectContext.prototype.save = function () {
        if (this.insertedObjects.length == 0 && this.updatedObjects.length == 0 && this.deletedObjects.length == 0)
            return;
        MIONotificationCenter.defaultCenter().postNotification(MIOManagedObjectContextWillSaveNotification, this);
        var deletedObjectsByEntityName = {};
        for (var index = 0; index < this.deletedObjects.count; index++) {
            var delObj = this.deletedObjects.objectAtIndex(index);
            var entityName = delObj.entity.name;
            var array = deletedObjectsByEntityName[entityName];
            if (array == null) {
                array = [];
                deletedObjectsByEntityName[entityName] = array;
            }
            array.addObject(delObj);
        }
        var insertedObjectsByEntityName = {};
        for (var index = 0; index < this.insertedObjects.count; index++) {
            var insObj = this.insertedObjects.objectAtIndex(index);
            this._obtainPermanentIDForObject(insObj);
            var entityName = insObj.entity.name;
            var array = insertedObjectsByEntityName[entityName];
            if (array == null) {
                array = [];
                insertedObjectsByEntityName[entityName] = array;
            }
            array.addObject(insObj);
        }
        var updatedObjectsByEntityName = {};
        for (var index = 0; index < this.updatedObjects.count; index++) {
            var updObj = this.updatedObjects.objectAtIndex(index);
            var entityName = updObj.entity.name;
            var array = updatedObjectsByEntityName[entityName];
            if (array == null) {
                array = [];
                updatedObjectsByEntityName[entityName] = array;
            }
            array.addObject(updObj);
        }
        if (this.parent == null) {
            var saveRequest = new MIOSaveChangesRequest();
            saveRequest.initWithObjects(insertedObjectsByEntityName, updatedObjectsByEntityName, deletedObjectsByEntityName);
            var store = this.persistentStoreCoordinator.persistentStores[0];
            store._executeRequest(saveRequest, this);
            for (var index = 0; index < this.insertedObjects.length; index++) {
                var obj = this.insertedObjects.objectAtIndex(index);
                obj._didCommit();
            }
            for (var index = 0; index < this.updatedObjects.length; index++) {
                var obj = this.updatedObjects.objectAtIndex(index);
                obj._didCommit();
            }
            for (var index = 0; index < this.deletedObjects.length; index++) {
                var obj = this.deletedObjects.objectAtIndex(index);
                this._unregisterObject(obj);
            }
            this.insertedObjects = MIOSet.set();
            this.updatedObjects = MIOSet.set();
            this.deletedObjects = MIOSet.set();
        }
        var objsChanges = {};
        objsChanges[MIOInsertedObjectsKey] = insertedObjectsByEntityName;
        objsChanges[MIOUpdatedObjectsKey] = updatedObjectsByEntityName;
        objsChanges[MIODeletedObjectsKey] = deletedObjectsByEntityName;
        var noty = new MIONotification(MIOManagedObjectContextDidSaveNotification, this, objsChanges);
        if (this.parent != null) {
            this.parent.mergeChangesFromContextDidSaveNotification(noty);
        }
        MIONotificationCenter.defaultCenter().postNotification(MIOManagedObjectContextDidSaveNotification, this, objsChanges);
    };
    MIOManagedObjectContext.prototype.mergeChangesFromContextDidSaveNotification = function (notification) {
        var insertedObjects = notification.userInfo[MIOInsertedObjectsKey];
        var updateObjects = notification.userInfo[MIOUpdatedObjectsKey];
        var deletedObjects = notification.userInfo[MIODeletedObjectsKey];
        for (var entityName in insertedObjects) {
            var ins_objs = insertedObjects[entityName];
            var array = this.insertedObjects[entityName];
            if (array == null) {
                array = [];
                this.insertedObjects[entityName] = array;
            }
            for (var i = 0; i < ins_objs.length; i++) {
                var o = ins_objs[i];
                var index = array.indexOf(o);
                if (index == -1)
                    array.push(o);
            }
        }
        for (var entityName in updateObjects) {
            var upd_objs = updateObjects[entityName];
            var array = this.updatedObjects[entityName];
            if (array == null) {
                array = [];
                this.updatedObjects[entityName] = array;
            }
            for (var i = 0; i < upd_objs.length; i++) {
                var o = upd_objs[i];
                var index = array.indexOf(o);
                if (index == -1)
                    array.push(o);
            }
        }
        for (var entityName in deletedObjects) {
            var del_objs = deletedObjects[entityName];
            var array = this.deletedObjects[entityName];
            if (array == null) {
                array = [];
                this.deletedObjects[entityName] = array;
            }
            for (var i = 0; i < del_objs.length; i++) {
                var o = del_objs[i];
                var index = array.indexOf(o);
                if (index == -1)
                    array.push(o);
            }
        }
    };
    MIOManagedObjectContext.prototype.performBlockAndWait = function (target, block) {
        this.blockChanges = {};
        this.blockChanges[MIOInsertedObjectsKey] = {};
        this.blockChanges[MIOUpdatedObjectsKey] = {};
        this.blockChanges[MIODeletedObjectsKey] = {};
        this.blockChanges[MIORefreshedObjectsKey] = {};
        block.call(target);
        var refresed = this.blockChanges[MIORefreshedObjectsKey];
        MIONotificationCenter.defaultCenter().postNotification(MIOManagedObjectContextObjectsDidChange, this, this.blockChanges);
        this.blockChanges = null;
    };
    return MIOManagedObjectContext;
}(MIOObject));
var MIOSaveChangesRequest = (function (_super) {
    __extends(MIOSaveChangesRequest, _super);
    function MIOSaveChangesRequest() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.insertedObjects = [];
        _this.updatedObjects = [];
        _this.deletedObjects = [];
        return _this;
    }
    MIOSaveChangesRequest.prototype.initWithObjects = function (inserted, updated, deleted) {
        this.insertedObjects = inserted;
        this.updatedObjects = updated;
        this.deletedObjects = deleted;
        this.requestType = MIORequestType.Save;
    };
    return MIOSaveChangesRequest;
}(MIOPersistentStoreRequest));
var MIOInMemoryStore = (function (_super) {
    __extends(MIOInMemoryStore, _super);
    function MIOInMemoryStore() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MIOInMemoryStore;
}(MIOPersistentStore));
var _MIOIncrementalStoreNodeDateTransformer = (function () {
    function _MIOIncrementalStoreNodeDateTransformer() {
    }
    _MIOIncrementalStoreNodeDateTransformer.sdf = MIOISO8601DateFormatter.iso8601DateFormatter();
    return _MIOIncrementalStoreNodeDateTransformer;
}());
var MIOIncrementalStoreNode = (function (_super) {
    __extends(MIOIncrementalStoreNode, _super);
    function MIOIncrementalStoreNode() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._objectID = null;
        _this._version = 0;
        _this._values = null;
        return _this;
    }
    Object.defineProperty(MIOIncrementalStoreNode.prototype, "objectID", {
        get: function () { return this._objectID; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MIOIncrementalStoreNode.prototype, "version", {
        get: function () { return this._version; },
        enumerable: true,
        configurable: true
    });
    MIOIncrementalStoreNode.prototype.initWithObjectID = function (objectID, values, version) {
        this._objectID = objectID;
        this._values = values;
        this._version = version;
    };
    MIOIncrementalStoreNode.prototype.updateWithValues = function (values, version) {
        for (var property in values)
            this._values[property] = values[property];
        this._version = version;
    };
    MIOIncrementalStoreNode.prototype.valueForPropertyDescription = function (property) {
        var value = this._values[property.name];
        if (property instanceof MIORelationshipDescription) {
            var rel = property;
            if (value == null) {
                value = this._values[rel.serverName];
            }
            return value;
        }
        else if (property instanceof MIOAttributeDescription) {
            var attr = property;
            var type = attr.attributeType;
            if (value == null) {
                var attr_1 = property;
                value = this._values[attr_1.serverName];
            }
            if (type == MIOAttributeType.Boolean) {
                if (typeof (value) === "boolean") {
                    return value;
                }
                else if (typeof (value) === "string") {
                    var lwValue = value.toLocaleLowerCase();
                    if (lwValue == "yes" || lwValue == "true" || lwValue == "1")
                        return true;
                    else
                        return false;
                }
                else {
                    var v = value > 0 ? true : false;
                    return v;
                }
            }
            else if (type == MIOAttributeType.Integer) {
                var v = parseInt(value);
                return isNaN(v) ? null : v;
            }
            else if (type == MIOAttributeType.Float || type == MIOAttributeType.Number) {
                var v = parseFloat(value);
                return isNaN(v) ? null : v;
            }
            else if (type == MIOAttributeType.String) {
                return value;
            }
            else if (type == MIOAttributeType.Date) {
                var date = _MIOIncrementalStoreNodeDateTransformer.sdf.dateFromString(value);
                return date;
            }
        }
        return value;
    };
    return MIOIncrementalStoreNode;
}(MIOObject));
var MIOIncrementalStore = (function (_super) {
    __extends(MIOIncrementalStore, _super);
    function MIOIncrementalStore() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MIOIncrementalStore.prototype.newObjectIDForEntity = function (entity, referenceObject) {
        if (entity == null)
            throw ("MIOIncrementalStore: Trying to create and object ID with NULL entity");
        var objID = MIOManagedObjectID._objectIDWithEntity(entity, referenceObject);
        objID._setPersistentStore(this);
        objID._setStoreIdentifier(this.identifier);
        console.log("New REFID: " + referenceObject);
        return objID;
    };
    MIOIncrementalStore.prototype.referenceObjectForObjectID = function (objectID) {
        return objectID._getReferenceObject();
    };
    MIOIncrementalStore.prototype.executeRequest = function (request, context) {
        return [];
    };
    MIOIncrementalStore.prototype.newValuesForObjectWithID = function (objectID, context) {
        return null;
    };
    MIOIncrementalStore.prototype.newValueForRelationship = function (relationship, objectID, context) {
        return null;
    };
    MIOIncrementalStore.prototype.obtainPermanentIDsForObjects = function (objects) {
        var array = [];
        for (var index = 0; index < objects.length; index++) {
            var obj = objects[index];
            array.addObject(obj.objectID);
        }
        return array;
    };
    MIOIncrementalStore.prototype.managedObjectContextDidRegisterObjectsWithIDs = function (objectIDs) { };
    MIOIncrementalStore.prototype.managedObjectContextDidUnregisterObjectsWithIDs = function (objectIDs) { };
    MIOIncrementalStore.prototype._executeRequest = function (request, context) {
        return this.executeRequest(request, context);
    };
    MIOIncrementalStore.prototype._obtainPermanentIDForObject = function (object) {
        return this.obtainPermanentIDsForObjects([object])[0];
    };
    MIOIncrementalStore.prototype._nodeForObjectID = function (objectID, context) {
        return this.newValuesForObjectWithID(objectID, context);
    };
    MIOIncrementalStore.prototype._objectIDForEntity = function (entity, referenceObject) {
        return this.newObjectIDForEntity(entity, referenceObject);
    };
    MIOIncrementalStore.prototype._fetchObjectWithObjectID = function (objectID, context) {
    };
    return MIOIncrementalStore;
}(MIOPersistentStore));
var MIOFetchSection = (function (_super) {
    __extends(MIOFetchSection, _super);
    function MIOFetchSection() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.objects = [];
        return _this;
    }
    MIOFetchSection.prototype.numberOfObjects = function () {
        return this.objects.length;
    };
    return MIOFetchSection;
}(MIOObject));
var MIOFetchedResultsController = (function (_super) {
    __extends(MIOFetchedResultsController, _super);
    function MIOFetchedResultsController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.sections = [];
        _this.resultObjects = [];
        _this.fetchRequest = null;
        _this.managedObjectContext = null;
        _this.sectionNameKeyPath = null;
        _this.registerObjects = {};
        _this._delegate = null;
        return _this;
    }
    MIOFetchedResultsController.prototype.initWithFetchRequest = function (request, managedObjectContext, sectionNameKeyPath) {
        this.fetchRequest = request;
        this.managedObjectContext = managedObjectContext;
        this.sectionNameKeyPath = sectionNameKeyPath;
    };
    Object.defineProperty(MIOFetchedResultsController.prototype, "delegate", {
        get: function () {
            return this._delegate;
        },
        set: function (delegate) {
            this._delegate = delegate;
            if (delegate != null) {
                MIONotificationCenter.defaultCenter().addObserver(this, MIOManagedObjectContextDidSaveNotification, function (notification) {
                    var moc = notification.object;
                    if (moc !== this.managedObjectContext)
                        return;
                    var ins_objs = notification.userInfo[MIOInsertedObjectsKey];
                    var upd_objs = notification.userInfo[MIOUpdatedObjectsKey];
                    var del_objs = notification.userInfo[MIODeletedObjectsKey];
                    var entityName = this.fetchRequest.entityName;
                    if (ins_objs[entityName] != null || upd_objs[entityName] != null || del_objs[entityName] != null)
                        this.updateContent(ins_objs[entityName] ? ins_objs[entityName] : [], upd_objs[entityName] ? upd_objs[entityName] : [], del_objs[entityName] ? del_objs[entityName] : []);
                });
                MIONotificationCenter.defaultCenter().addObserver(this, MIOManagedObjectContextObjectsDidChange, function (notification) {
                    var moc = notification.object;
                    if (moc !== this.managedObjectContext)
                        return;
                    var refreshed = notification.userInfo[MIORefreshedObjectsKey];
                    if (refreshed == null)
                        return;
                    var entityName = this.fetchRequest.entityName;
                    var objects = refreshed[entityName];
                    if (objects == null)
                        return;
                    this.refreshObjects(objects);
                });
            }
            else {
                MIONotificationCenter.defaultCenter().removeObserver(this, MIOManagedObjectContextDidSaveNotification);
                MIONotificationCenter.defaultCenter().removeObserver(this, MIOManagedObjectContextObjectsDidChange);
            }
        },
        enumerable: true,
        configurable: true
    });
    MIOFetchedResultsController.prototype.performFetch = function () {
        this.resultObjects = this.managedObjectContext.executeFetch(this.fetchRequest);
        this._splitInSections();
        return this.resultObjects;
    };
    MIOFetchedResultsController.prototype.processObject = function (object) {
        var ref = object.objectID._getReferenceObject();
        if (this.registerObjects[ref] == null) {
            this.resultObjects.push(object);
        }
        else {
        }
    };
    MIOFetchedResultsController.prototype.checkObjects = function (objects) {
        var predicate = this.fetchRequest.predicate;
        for (var count = 0; count < objects.length; count++) {
            var obj = objects.objectAtIndex(count);
            if (predicate != null) {
                var result = predicate.evaluateObject(obj);
                if (result)
                    this.processObject(obj);
            }
            else {
                this.processObject(obj);
            }
        }
    };
    MIOFetchedResultsController.prototype.refreshObjects = function (objects) {
        this.checkObjects(objects);
        this.resultObjects = _MIOSortDescriptorSortObjects(this.resultObjects, this.fetchRequest.sortDescriptors);
        this._splitInSections();
        this._notify();
    };
    MIOFetchedResultsController.prototype.updateContent = function (inserted, updated, deleted) {
        this.checkObjects(inserted);
        this.checkObjects(updated);
        for (var i = 0; i < deleted.length; i++) {
            var o = deleted[i];
            var index = this.resultObjects.indexOf(o);
            if (index != -1) {
                this.resultObjects.splice(index, 1);
                var ref = o.objectID._getReferenceObject();
                delete this.registerObjects[ref];
            }
        }
        this.resultObjects = _MIOSortDescriptorSortObjects(this.resultObjects, this.fetchRequest.sortDescriptors);
        this._splitInSections();
        this._notify();
    };
    MIOFetchedResultsController.prototype._notify = function () {
        if (this._delegate != null) {
            if (typeof this._delegate.controllerWillChangeContent === "function")
                this._delegate.controllerWillChangeContent(this);
            for (var sectionIndex = 0; sectionIndex < this.sections.length; sectionIndex++) {
                if (typeof this._delegate.didChangeSection === "function")
                    this._delegate.didChangeSection(this, sectionIndex, "insert");
                if (typeof this._delegate.didChangeObject === "function") {
                    var section = this.sections[sectionIndex];
                    var items = section.objects;
                    for (var index = 0; index < items.length; index++) {
                        var obj = items[index];
                        this._delegate.didChangeObject(this, index, "insert", obj);
                    }
                }
            }
            if (typeof this._delegate.controllerDidChangeContent === "function")
                this._delegate.controllerDidChangeContent(this);
        }
    };
    MIOFetchedResultsController.prototype._splitInSections = function () {
        this.sections = [];
        if (this.sectionNameKeyPath == null) {
            var section = new MIOFetchSection();
            for (var index = 0; index < this.resultObjects.length; index++) {
                var obj = this.resultObjects[index];
                var ref = obj.objectID._getReferenceObject();
                this.registerObjects[ref] = obj;
                section.objects.push(obj);
            }
            this.sections.push(section);
        }
        else {
            var currentSection = null;
            var currentSectionKeyPathValue = "";
            for (var index = 0; index < this.resultObjects.length; index++) {
                var obj = this.resultObjects[index];
                var ref = obj.objectID._getReferenceObject();
                this.registerObjects[ref] = obj;
                var value = obj.valueForKey(this.sectionNameKeyPath);
                if (currentSectionKeyPathValue != value) {
                    currentSection = new MIOFetchSection();
                    this.sections.push(currentSection);
                    currentSectionKeyPathValue = value;
                }
                currentSection.objects.push(obj);
            }
        }
    };
    MIOFetchedResultsController.prototype.objectAtIndexPath = function (indexPath) {
        var section = this.sections[indexPath.section];
        var object = section.objects[indexPath.row];
        return object;
    };
    return MIOFetchedResultsController;
}(MIOObject));
var MIOMergePolicy = (function (_super) {
    __extends(MIOMergePolicy, _super);
    function MIOMergePolicy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MIOMergePolicy;
}(MIOObject));
//# sourceMappingURL=index.js.map