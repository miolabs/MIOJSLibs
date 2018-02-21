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
var MWSRequest = (function (_super) {
    __extends(MWSRequest, _super);
    function MWSRequest() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.url = null;
        _this.httpMethod = "GET";
        _this.body = null;
        _this.bodyData = null;
        _this.headers = {};
        _this.resultCode = 0;
        _this.resultData = null;
        _this.urlRequest = null;
        return _this;
    }
    MWSRequest.prototype.initWithURL = function (url, body, httpMethod) {
        this.url = url;
        this.body = body;
        if (httpMethod != null)
            this.httpMethod = httpMethod;
    };
    MWSRequest.prototype.setHeaderValue = function (value, key) {
        this.headers[key] = value;
    };
    MWSRequest.prototype.send = function (target, completion) {
        this.willStart();
        this.urlRequest = MIOURLRequest.requestWithURL(this.url);
        for (var key in this.headers) {
            var value = this.headers[key];
            this.urlRequest.setHeaderField(key, value);
        }
        this.urlRequest.httpMethod = this.httpMethod;
        this.urlRequest.httpBody = this.bodyData;
        var con = new MIOURLConnection();
        con.initWithRequestBlock(this.urlRequest, this, function (code, data, blob) {
            this.resultCode = code;
            this.resultData = data;
            this.didFinish();
            if (completion != null) {
                completion.call(target, code, this.resultData);
            }
        });
    };
    MWSRequest.prototype.willStart = function () { };
    MWSRequest.prototype.didFinish = function () { };
    return MWSRequest;
}(MIOObject));
var MWSJSONRequest = (function (_super) {
    __extends(MWSJSONRequest, _super);
    function MWSJSONRequest() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MWSJSONRequest.prototype.willStart = function () {
        this.setHeaderValue("application/json", "Content-Type");
        if (this.body != null) {
            this.bodyData = JSON.stringify(this.body);
        }
    };
    MWSJSONRequest.prototype.didFinish = function () {
        if (this.resultData != null && this.resultData != "") {
            try {
                this.resultData = JSON.parse(this.resultData.replace(/(\r\n|\n|\r)/gm, ""));
            }
            catch (error) {
                MIOLog("JSON PARSER ERROR: BODY -> " + this.bodyData);
                MIOLog("JSON PARSER ERROR: RESULT -> " + this.resultData);
            }
        }
    };
    return MWSJSONRequest;
}(MWSRequest));
var MWSPersistenStoreOperation = (function (_super) {
    __extends(MWSPersistenStoreOperation, _super);
    function MWSPersistenStoreOperation() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.saveCount = 0;
        _this.request = null;
        _this.dependencyIDs = null;
        _this.responseCode = null;
        _this.responseJSON = null;
        _this.delegate = null;
        _this.uploading = false;
        _this.uploaded = false;
        return _this;
    }
    MWSPersistenStoreOperation.prototype.setUploading = function (value) {
        this.willChangeValue("isExecuting");
        this.uploading = value;
        this.didChangeValue("isExecuting");
    };
    MWSPersistenStoreOperation.prototype.setUploaded = function (value) {
        this.willChangeValue("isFinished");
        this.uploaded = value;
        this.didChangeValue("isFinished");
    };
    MWSPersistenStoreOperation.prototype.initWithDelegate = function (delegate) {
        this.init();
        this.delegate = delegate;
    };
    MWSPersistenStoreOperation.prototype.start = function () {
        if (this.uploading == true)
            throw ("MWSPersistenStoreUploadOperation: Trying to start again on an executing operation");
        this.setUploading(true);
        this.request.send(this, function (code, data) {
            this.responseCode = code;
            this.responseJSON = data;
            this.setUploading(false);
            this.setUploaded(true);
        });
    };
    MWSPersistenStoreOperation.prototype.executing = function () {
        return this.uploading;
    };
    MWSPersistenStoreOperation.prototype.finished = function () {
        return this.uploaded;
    };
    return MWSPersistenStoreOperation;
}(MIOOperation));
var MWSPersistentStoreDidChangeEntityStatus = "MWSPersistentStoreDidChangeEntityStatus";
var MWSPersistentStoreFetchStatus;
(function (MWSPersistentStoreFetchStatus) {
    MWSPersistentStoreFetchStatus[MWSPersistentStoreFetchStatus["None"] = 0] = "None";
    MWSPersistentStoreFetchStatus[MWSPersistentStoreFetchStatus["Downloading"] = 1] = "Downloading";
    MWSPersistentStoreFetchStatus[MWSPersistentStoreFetchStatus["Downloaded"] = 2] = "Downloaded";
})(MWSPersistentStoreFetchStatus || (MWSPersistentStoreFetchStatus = {}));
var MWSPersistentStoreRequestType;
(function (MWSPersistentStoreRequestType) {
    MWSPersistentStoreRequestType[MWSPersistentStoreRequestType["Fetch"] = 0] = "Fetch";
    MWSPersistentStoreRequestType[MWSPersistentStoreRequestType["Insert"] = 1] = "Insert";
    MWSPersistentStoreRequestType[MWSPersistentStoreRequestType["Update"] = 2] = "Update";
    MWSPersistentStoreRequestType[MWSPersistentStoreRequestType["Delete"] = 3] = "Delete";
})(MWSPersistentStoreRequestType || (MWSPersistentStoreRequestType = {}));
var MWSPersistentStoreError;
(function (MWSPersistentStoreError) {
    MWSPersistentStoreError[MWSPersistentStoreError["NoStoreURL"] = 0] = "NoStoreURL";
    MWSPersistentStoreError[MWSPersistentStoreError["InvalidRequest"] = 1] = "InvalidRequest";
})(MWSPersistentStoreError || (MWSPersistentStoreError = {}));
var MWSPersistentStore = (function (_super) {
    __extends(MWSPersistentStore, _super);
    function MWSPersistentStore() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.delegate = null;
        _this.storeURL = null;
        _this.entitiesInfo = {};
        _this.nodesByReferenceID = {};
        _this.referenceIDByObjectsID = {};
        _this.objectIDByReferenceID = {};
        _this.fetchingObjects = {};
        _this.partialRelationshipObjects = {};
        _this.saveCount = 0;
        _this.fetchOperationQueue = null;
        _this.saveOperationQueue = null;
        _this.saveOperationsByReferenceID = {};
        return _this;
    }
    Object.defineProperty(MWSPersistentStore, "type", {
        get: function () { return "MWSPersistentStore"; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MWSPersistentStore.prototype, "type", {
        get: function () { return MWSPersistentStore.type; },
        enumerable: true,
        configurable: true
    });
    MWSPersistentStore.prototype.loadMetadata = function () {
        if (this.url == null)
            throw "MWSPersistentStoreError.NoStoreURL";
        this.storeURL = this.url;
        var uuid = MIOUUID.uuid();
        var metadata = { MIOStoreUUIDKey: uuid, MIOStoreTypeKey: "MWSPersistentStore" };
        this.metadata = metadata;
        return null;
    };
    MWSPersistentStore.prototype.executeRequest = function (request, context) {
        if (request instanceof MIOFetchRequest) {
            this.fetchObjects(request, context);
            return [];
        }
        else if (request instanceof MIOSaveChangesRequest) {
            this.saveObjects(request, context);
            return [];
        }
        else {
            throw "MWSPersistentStoreError.InvalidRequest";
        }
    };
    MWSPersistentStore.prototype.newValuesForObjectWithID = function (objectID, context) {
        var serverID = this.referenceObjectForObjectID(objectID);
        if (serverID == null)
            throw ("MWSPersistentStore: Asking objectID without reference object");
        var node = this.nodeWithServerID(serverID, objectID.entity);
        if (node.version == 0) {
            this.fetchObjectWithServerID(serverID, objectID.entity.name, context);
        }
        return node;
    };
    MWSPersistentStore.prototype.newValueForRelationship = function (relationship, objectID, context) {
        var serverID = this.referenceObjectForObjectID(objectID);
        var referenceID = objectID.entity.name + "://" + serverID;
        if (referenceID == null)
            throw ("MWSPersistentStore: Asking objectID without referenceID");
        var node = this.nodesByReferenceID[referenceID];
        var relationName = relationship.name;
        if (relationship.isToMany == false) {
            var relRefID = node.valueForPropertyDescription(relationship);
            if (relRefID == null)
                return null;
            var relNode = this.nodeWithServerID(relRefID, relationship.destinationEntity);
            if (relNode == null) {
                relNode = this.newNodeWithValuesAtServerID(relRefID, {}, -1, relationship.destinationEntity);
            }
            return relNode.objectID;
        }
        else {
            var relRefIDs = node.valueForPropertyDescription(relationship);
            if (relRefIDs == null)
                return null;
            var array = [];
            for (var count = 0; count < relRefIDs.length; count++) {
                var relRefID = relRefIDs[count];
                var relNode = this.nodeWithServerID(relRefID, relationship.destinationEntity);
                if (relNode == null) {
                    relNode = this.newNodeWithValuesAtServerID(relRefID, {}, -1, relationship.destinationEntity);
                }
                array.push(relNode.objectID);
            }
            return array;
        }
    };
    MWSPersistentStore.prototype.obtainPermanentIDsForObjects = function (objects) {
        var array = [];
        for (var index = 0; index < objects.length; index++) {
            var obj = objects[index];
            var serverID = this.delegate.serverIDForObject(this, obj);
            var objID = this.newObjectIDForEntity(obj.entity, serverID);
            array.addObject(objID);
        }
        return array;
    };
    MWSPersistentStore.prototype.managedObjectContextDidRegisterObjectsWithIDs = function (objectIDs) {
    };
    MWSPersistentStore.prototype.managedObjectContextDidUnregisterObjectsWithIDs = function (objectIDs) {
    };
    MWSPersistentStore.prototype._fetchObjectWithObjectID = function (objectID, context) {
        var serverID = objectID._getReferenceObject();
        var entityName = objectID.entity.name;
        this.fetchObjectWithServerID(serverID, entityName, context);
    };
    MWSPersistentStore.prototype.fetchObjectWithServerID = function (serverID, entityName, context) {
        if (this.delegate == null)
            return;
        if (this.fetchingObjects[serverID] != null)
            return;
        this.fetchingObjects[serverID] = true;
        MIOLog("Downloading REFID: " + serverID);
        var fetchRequest = MIOFetchRequest.fetchRequestWithEntityName(entityName);
        fetchRequest.entity = MIOEntityDescription.entityForNameInManagedObjectContext(entityName, context);
        var request = this.delegate.fetchRequestForWebStore(this, fetchRequest, serverID);
        if (request == null)
            return;
        MIONotificationCenter.defaultCenter().postNotification(MWSPersistentStoreDidChangeEntityStatus, entityName, { "Status": MWSPersistentStoreFetchStatus.Downloading });
        request.send(this, function (code, data) {
            var _a = this.delegate.requestDidFinishForWebStore(this, fetchRequest, code, data), result = _a[0], values = _a[1];
            MIOLog("Downloaded REFID: " + serverID);
            delete this.fetchingObjects[serverID];
            if (result == true) {
                this.updateObjectInContext(values, fetchRequest.entity, context);
            }
            MIONotificationCenter.defaultCenter().postNotification(MWSPersistentStoreDidChangeEntityStatus, entityName, { "Status": MWSPersistentStoreFetchStatus.Downloaded });
        });
    };
    MWSPersistentStore.prototype.fetchObjects = function (fetchRequest, context, target, completion) {
        var entityName = fetchRequest.entity.name;
        if (this.delegate == null)
            return;
        var request = this.delegate.fetchRequestForWebStore(this, fetchRequest, null);
        if (request == null)
            return;
        MIONotificationCenter.defaultCenter().postNotification(MWSPersistentStoreDidChangeEntityStatus, entityName, { "Status": MWSPersistentStoreFetchStatus.Downloading });
        var objects = null;
        request.send(this, function (code, data) {
            var _a = this.delegate.requestDidFinishForWebStore(this, fetchRequest, code, data), result = _a[0], items = _a[1];
            if (result == true) {
                var relationships = fetchRequest.relationshipKeyPathsForPrefetching;
                var array = [];
                for (var index = 0; index < relationships.length; index++) {
                    var relname = relationships[index];
                    var rel = fetchRequest.entity.relationshipsByName[relname];
                    if (rel != null)
                        array.push(rel);
                }
                objects = this.updateObjectsInContext(items, fetchRequest.entity, context, array);
            }
            MIONotificationCenter.defaultCenter().postNotification(MWSPersistentStoreDidChangeEntityStatus, entityName, { "Status": MWSPersistentStoreFetchStatus.Downloaded });
            if (target != null && completion != null) {
                completion.call(target, objects);
            }
        });
    };
    MWSPersistentStore.prototype.updateObjectsInContext = function (items, entity, context, relationshipEntities) {
        if (context == null)
            return;
        if (items == null)
            return;
        var objects = [];
        context.performBlockAndWait(this, function () {
            for (var index = 0; index < items.length; index++) {
                var objectValues = items[index];
                var obj = this.updateObjectInContext(objectValues, entity, context, null, relationshipEntities);
                objects.addObject(obj);
            }
        });
        return objects;
    };
    MWSPersistentStore.prototype.updateObjectInContext = function (values, entity, context, objectID, relationshipEntities) {
        var relationshipsObjects = relationshipEntities != null ? relationshipEntities : [];
        this.checkRelationships(values, entity, context, relationshipsObjects);
        var serverID = this.delegate.serverIDForItem(this, values, entity.name);
        if (serverID == null)
            throw ("SERVER ID CAN NOT BE NULL");
        var version = this.delegate.serverVersionNumberForItem(this, values, entity.name);
        var node = this.nodeWithServerID(serverID, entity);
        if (node == null) {
            MIOLog("New version: " + entity.name + " (" + version + ")");
            node = this.newNodeWithValuesAtServerID(serverID, values, version, entity, objectID);
        }
        else if (version > node.version) {
            MIOLog("Update version: " + entity.name + " (" + node.version + " -> " + version + ")");
            this.updateNodeWithValuesAtServerID(serverID, values, version, entity);
        }
        else {
            this.updateNodeWithValuesAtServerID(serverID, values, version, entity);
        }
        var obj = context.existingObjectWithID(node.objectID);
        if (obj != null)
            context.refreshObject(obj, true);
        return obj;
    };
    MWSPersistentStore.prototype.nodeWithServerID = function (serverID, entity) {
        var referenceID = entity.name + "://" + serverID;
        return this.nodesByReferenceID[referenceID];
    };
    MWSPersistentStore.prototype.newNodeWithValuesAtServerID = function (serverID, values, version, entity, objectID) {
        var referenceID = entity.name + "://" + serverID;
        var objID = objectID != null ? objectID : this.newObjectIDForEntity(entity, serverID);
        var node = new MIOIncrementalStoreNode();
        node.initWithObjectID(objID, values, version);
        this.nodesByReferenceID[referenceID] = node;
        MIOLog("Inserting REFID: " + referenceID);
        return node;
    };
    MWSPersistentStore.prototype.updateNodeWithValuesAtServerID = function (serverID, values, version, entity) {
        var referenceID = entity.name + "://" + serverID;
        var node = this.nodesByReferenceID[referenceID];
        node.updateWithValues(values, version);
        MIOLog("Updating REFID: " + referenceID);
    };
    MWSPersistentStore.prototype.deleteNodeAtServerID = function (serverID, entity) {
        var referenceID = entity.name + "://" + serverID;
        delete this.nodesByReferenceID[referenceID];
        MIOLog("Deleting REFID: " + referenceID);
    };
    MWSPersistentStore.prototype.checkRelationships = function (values, entity, context, relationshipEntities) {
        for (var index = 0; index < relationshipEntities.length; index++) {
            var relEntity = relationshipEntities[index];
            var serverRelName = this.delegate.serverRelationshipName(this, relEntity.name, entity);
            var value = values[serverRelName];
            if (value == null)
                continue;
            if (relEntity.isToMany == false) {
                this.updateObjectInContext(value, relEntity.destinationEntity, context);
                var serverID = this.delegate.serverIDForItem(this, value, relEntity.destinationEntity.name);
                values[serverRelName] = serverID;
            }
            else {
                var array = [];
                for (var count = 0; count < value.length; count++) {
                    var serverValues = value[count];
                    var obj = this.updateObjectInContext(serverValues, relEntity.destinationEntity, context);
                    var serverID = this.delegate.serverIDForItem(this, serverValues, relEntity.destinationEntityName);
                    array.addObject(serverID);
                }
                values[serverRelName] = array;
            }
        }
    };
    MWSPersistentStore.prototype.saveObjects = function (request, context) {
        if (context == null)
            return;
        var inserts = request.insertedObjects;
        for (var entityName in inserts) {
            var array = inserts[entityName];
            for (var index = 0; index < array.length; index++) {
                var obj = array[index];
                this.insertObjectToServer(obj);
            }
        }
        var updates = request.updatedObjects;
        for (var entityName in updates) {
            var array = updates[entityName];
            for (var index = 0; index < array.length; index++) {
                var obj = array[index];
                this.updateObjectOnServer(obj);
            }
        }
        var deletes = request.deletedObjects;
        for (var entityName in deletes) {
            var array = deletes[entityName];
            for (var index = 0; index < array.length; index++) {
                var obj = array[index];
                this.deleteObjectOnServer(obj);
            }
        }
        this.uploadToServer();
        this.saveCount++;
    };
    MWSPersistentStore.prototype.insertObjectToServer = function (object) {
        if (this.delegate == null)
            return;
        var entityName = object.entity.name;
        var serverID = this.delegate.serverIDForObject(this, object);
        this.newNodeWithValuesAtServerID(serverID, {}, -1, object.entity, object.objectID);
        var values = this.delegate.serverValuesForObject(this, object, true);
        this.updateNodeWithValuesAtServerID(serverID, values, 0, object.entity);
        var dependencyIDs = [];
        var request = this.delegate.insertRequestForWebStore(this, object, dependencyIDs);
        if (request == null)
            return;
        var op = new MWSPersistenStoreOperation();
        op.initWithDelegate(this);
        op.request = request;
        op.dependencyIDs = dependencyIDs;
        op.saveCount = this.saveCount;
        this.addOperation(op, serverID);
        MIOLog("OPERATION: Insert " + object.entity.name + " -> " + serverID + ":" + this.saveCount);
        op.target = this;
        op.completion = function () {
            MIOLog("OPERATION: Insert " + object.entity.name + " -> " + serverID + ":" + op.saveCount + " (OK)");
            var _a = this.delegate.requestDidFinishForWebStore(this, null, op.responseCode, op.responseJSON), result = _a[0], values = _a[1];
            var version = this.delegate.serverVersionNumberForItem(this, values);
            MIOLog("Object " + serverID + " -> Insert " + (result ? "OK" : "FAIL") + " (" + version + ")");
            if (version > 1)
                this.updateObjectInContext(values, object.entity, object.managedObjectContext, object.objectID);
        };
    };
    MWSPersistentStore.prototype.updateObjectOnServer = function (object) {
        if (this.delegate == null)
            return;
        var entityName = object.entity.name;
        var serverID = this.delegate.serverIDForObject(this, object);
        var values = this.delegate.serverValuesForObject(this, object, true);
        var node = this.nodeWithServerID(serverID, object.entity);
        this.updateNodeWithValuesAtServerID(serverID, values, node.version + 1, object.entity);
        var dependencyIDs = [];
        var request = this.delegate.updateRequestForWebStore(this, object, dependencyIDs);
        if (request == null)
            return;
        var op = new MWSPersistenStoreOperation();
        op.initWithDelegate(this);
        op.request = request;
        op.dependencyIDs = dependencyIDs;
        op.saveCount = this.saveCount;
        this.addOperation(op, serverID);
        MIOLog("OPERATION: Update " + object.entity.name + " -> " + serverID + ":" + this.saveCount);
        op.target = this;
        op.completion = function () {
            MIOLog("OPERATION: Update " + object.entity.name + " -> " + serverID + ":" + op.saveCount + " (OK)");
            var result = this.delegate.requestDidFinishForWebStore(this, null, op.responseCode, op.responseJSON)[0];
            var version = this.delegate.serverVersionNumberForItem(this, values);
            MIOLog("Object " + serverID + " -> Update " + (result ? "OK" : "FAIL") + " (" + version + ")");
            if (version > node.version)
                this.updateObjectInContext(values, object.entity, object.managedObjectContext, object.objectID);
        };
    };
    MWSPersistentStore.prototype.deleteObjectOnServer = function (object) {
        if (this.delegate == null)
            return;
        var entityName = object.entity.name;
        var serverID = this.delegate.serverIDForObject(this, object);
        var node = this.nodeWithServerID(serverID, object.entity);
        this.deleteNodeAtServerID(serverID, object.entity);
        var request = this.delegate.deleteRequestForWebStore(this, object);
        if (request == null)
            return;
        var op = new MWSPersistenStoreOperation();
        op.initWithDelegate(this);
        op.request = request;
        op.dependencyIDs = [];
        op.saveCount = this.saveCount;
        this.addOperation(op, serverID);
        MIOLog("OPERATION: Delete " + object.entity.name + " -> " + serverID);
        op.target = this;
        op.completion = function () {
            MIOLog("OPERATION: Delete " + object.entity.name + " -> " + serverID + "(OK)");
            var result = this.delegate.requestDidFinishForWebStore(this, null, op.responseCode, op.responseJSON)[0];
            MIOLog("Object " + serverID + " -> Deleted " + (result ? "OK" : "FAIL"));
        };
    };
    MWSPersistentStore.prototype.addOperation = function (operation, serverID) {
        var opRef = serverID + "/" + operation.saveCount;
        this.saveOperationsByReferenceID[opRef] = operation;
    };
    MWSPersistentStore.prototype.removeOperation = function (operation, serverID) {
        var opRef = serverID + "/" + operation.saveCount;
        delete this.saveOperationsByReferenceID[opRef];
    };
    MWSPersistentStore.prototype.operationAtServerID = function (serverID, saveCount) {
        var opRef = serverID + "/" + saveCount;
        return this.saveOperationsByReferenceID[opRef];
    };
    MWSPersistentStore.prototype.fetchFromServer = function () {
        if (this.fetchOperationQueue == null) {
            this.fetchOperationQueue = new MIOOperationQueue();
            this.fetchOperationQueue.init();
        }
    };
    MWSPersistentStore.prototype.checkOperationDependecies = function (operation, dependencies) {
        for (var index = 0; index < dependencies.length; index++) {
            var referenceID = dependencies[index];
            var op = this.operationAtServerID(referenceID, this.saveCount);
            if (op == null)
                continue;
            operation.addDependency(op);
        }
    };
    MWSPersistentStore.prototype.uploadToServer = function () {
        if (this.saveOperationQueue == null) {
            this.saveOperationQueue = new MIOOperationQueue();
            this.saveOperationQueue.init();
            this.saveOperationQueue.addObserver(this, "operationCount", null);
        }
        for (var refID in this.saveOperationsByReferenceID) {
            var op = this.saveOperationsByReferenceID[refID];
            this.checkOperationDependecies(op, op.dependencyIDs);
            this.saveOperationQueue.addOperation(op);
        }
        this.saveOperationsByReferenceID = {};
    };
    return MWSPersistentStore;
}(MIOIncrementalStore));
//# sourceMappingURL=index.js.map