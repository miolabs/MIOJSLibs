
/// <reference path="../MIOData/MIOData.ts" />

enum MWSPersistentStoreRequestType {
    Fetch,
    Insert,
    Update,
    Delete
}

enum MWSPersistentStoreError {
    NoStoreURL,
    InvalidRequest
}

class MWSPersistentStore extends MIOIncrementalStore {
    static get type(): string { return "MWSPersistentStore"; }
    get type(): string { return MWSPersistentStore.type; }

    delegate = null;

    storeURL: MIOURL = null;
    entitiesInfo = {};
    itemsByReferenceID = {};

    loadMetadata(): MIOError {

        if (this.url == null) throw "MWSPersistentStoreError.NoStoreURL";
        this.storeURL = this.url;

        let uuid = MIOUUID.uuid();
        let metadata = { MIOStoreUUIDKey: uuid, MIOStoreTypeKey: "MWSPersistentStore" };
        this.metadata = metadata;

        return null;
    }

    executeRequest(request: MIOPersistentStoreRequest, context: MIOManagedObjectContext) {

        if (request instanceof MIOFetchRequest) {
            let obs = this.fetchObjects(request as MIOFetchRequest, context);
            return obs;
        }
        else if (request instanceof MIOSaveChangesRequest) {
            //this.saveObjects(request as MIOSaveChangesRequest, context);
            return [];
        }
        else {
            throw "MWSPersistentStoreError.InvalidRequest";
        }
    }

    newValuesForObjectWithID(objectID: MIOManagedObjectID, context: MIOManagedObjectContext): MIOIncrementalStoreNode {

        var node = new MIOIncrementalStoreNode();
        let refID = this.referenceObjectForObjectID(objectID);
        if (refID == null) {
            node.initWithObjectID(objectID, {}, 1);
            return node;
        }

        let item = this.itemsByReferenceID[refID];
        if (item == null) {
            var node = new MIOIncrementalStoreNode();
            node.initWithObjectID(objectID, {}, 1);
            return node;
        }

        node.initWithObjectID(objectID, item, 1);

        return node;
    }

    newValueForRelationship(relationship: MIORelationshipDescription, objectID: string, context?: MIOManagedObjectContext) {

        //let relationName = relationship.name
        let objectIDs = [];
        return objectIDs;
    }

    private fetchObjects(fetchRequest: MIOFetchRequest, context?: MIOManagedObjectContext) {

        let entityName = fetchRequest.entity.name;

        if (this.delegate == null) return [];

        let request = this.delegate.newRequestForWebStore(this, MWSPersistentStoreRequestType.Fetch, fetchRequest, null, null);
        if (request == null) return [];

        request.send(this, function (code, data) {
            var [result, items] = this.delegate.requestDidFinishForWebStore(this, fetchRequest, code, data);
            if (result == true) {
                this.updateObjects(items, fetchRequest.entity, context);
            }
        });

        return [];
    }

    private updateObjects(items, entity: MIOEntityDescription, context?: MIOManagedObjectContext) {

        if (context == null) return;
        if (items == null) return;

        context.performBlockAndWait(this, function () {

            for (var index = 0; index < items.length; index++) {

                let i = items[index];
                let refID = i["id"];
                if (refID != null) {

                    this.itemsByReferenceID[refID] = i;
                    let objID = this.newObjectIDForEntity(entity, refID);
                    let obj = context.existingObjectWithID(objID);
                    if (obj != null) context.refreshObject(obj, true);
                }
            }
        });

    }

    private saveObjects(request: MIOSaveChangesRequest, context?: MIOManagedObjectContext) {

        if (context == null) return;

        let inserts = request.insertedObjects;
        for (var index = 0; index < inserts.length; index++) {
            let obj: MIOManagedObject = inserts[index];
            this.insertObjectOnServer(obj);
            obj.isFault = false;
        }

        let updates = request.updatedObjects;
        for (var index = 0; index < updates.length; index++) {
            let obj: MIOManagedObject = updates[index];
            this.updateObjectOnServer(obj);
            obj.isFault = false;
        }

        let deletes = request.deletedObjects;
        for (var index = 0; index < deletes.length; index++) {
            let obj: MIOManagedObject = deletes[index];
            this.deleteObjectOnServer(obj);
            obj.isFault = false;
        }
    }

    private insertObjectOnServer(object: MIOManagedObject) {

    }

    private updateObjectOnServer(object: MIOManagedObject) {

        if (this.delegate == null) return;

        let entityName = object.entity.name;
        let refID = this.referenceObjectForObjectID(object.objectID);

        let values = object.changedValues();

        let request = this.delegate.newRequestForWebStore(this, MWSPersistentStoreRequestType.Update, entityName, refID, values);
        if (request == null) throw "MWSPersistentStoreError.InvalidRequest";
        request.send(this, function (code, data) {
            let [result] = this.delegate.requestDidFinishForWebStore(this, null, code, data);
            if (result == true) {
                MIOLog("Saved!");
            }
        });
    }

    private deleteObjectOnServer(object: MIOManagedObject) {

    }


}