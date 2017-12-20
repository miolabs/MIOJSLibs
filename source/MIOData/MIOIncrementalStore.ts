
/// <reference path="MIOPersistentStore.ts" />
/// <reference path="MIOIncrementalStoreNode.ts" />

class MIOIncrementalStore extends MIOPersistentStore {
    static get type(): string { return "MIOIncrementalStore"; }
    get type(): string { return MIOIncrementalStore.type; }

    private referenceObjectByObjectID = {};
    private nodesByObjectID = {};
    private objectsByID = {};

    private dateFormatter = MIOISO8601DateFormatter.iso8601DateFormatter();

    newObjectIDForEntity(entity: MIOEntityDescription, referenceObject: string): MIOManagedObjectID {

        if (entity == null) throw("MIOIncrementalStore: Trying to create and object ID with NULL entity");

        let objID = MIOManagedObjectID.objectIDWithEntity(entity);
        objID.persistentStore = this;
        this.referenceObjectByObjectID[objID.identifier] = referenceObject;
        
        console.log("New REFID: " + referenceObject);

        return objID;
    }

    referenceObjectForObjectID(objectID: MIOManagedObjectID) {
        return this.referenceObjectByObjectID[objectID.identifier];
    }

    newValuesForObjectWithID(objectID: MIOManagedObjectID, context: MIOManagedObjectContext): MIOIncrementalStoreNode {
        return null;
    }

    newValueForRelationship(relationship: MIORelationshipDescription, objectID: MIOManagedObjectID, context?: MIOManagedObjectContext) {
        return null;
    } 

    fetchObjectWithObjectID(objectID:MIOManagedObjectID, context:MIOManagedObjectContext, mergeChanges:boolean){
        let obj: MIOManagedObject = this.objectsByID[objectID.identifier];
        if (obj == null) {
            let node = this.newValuesForObjectWithID(objectID, context);
            if (node == null) throw("MIOIncrementalStore: Node CAN NOT BE NULL");
            if (this.nodesByObjectID[objectID.identifier] == null) {
                let entity: MIOEntityDescription = objectID.entity;
                obj = MIOClassFromString(entity.name);
                obj.objectID = objectID;
                obj.entity = entity;
                obj.managedObjectContext = context;
                this.objectsByID[objectID.identifier] = obj;
                if (mergeChanges == true)
                    this.fillObjectValuesFromNode(node, obj, context);
            }
            this.nodesByObjectID[objectID.identifier] = node;
        }

        return obj;
    }

    updateObjectWithObjectID(objectID: MIOManagedObjectID, context: MIOManagedObjectContext):number {
        let obj: MIOManagedObject = this.objectsByID[objectID.identifier];
        let node = this.newValuesForObjectWithID(objectID, context);
        this.fillObjectValuesFromNode(node, obj, context);
        return node.version;
    }

    private fillObjectValuesFromNode(node:MIOIncrementalStoreNode, object:MIOManagedObject, context:MIOManagedObjectContext) {
        
        this.parseObjectAttributesFromNode(node, object);
        this.parseObjectRelationshipsFromNode(node, object, context);
    }

    private parseObjectAttributesFromNode(node:MIOIncrementalStoreNode, mo: MIOManagedObject) {

        let attributes = mo.entity.attributes;
        for (var i = 0; i < attributes.length; i++) {
            let attr: MIOAttributeDescription = attributes[i];
            let value = node.valueForPropertyDescription(attr);
            // if (value == null && attr.optional == false && attr.defaultValue == null) {
            //     throw ("MIOWebPersistentStore: Couldn't set attribute value (" + mo.className + "." + attr.name + "). Value is nil and it's not optional.");
            // }    
            if (value == null && attr.defaultValue != null) value = attr.defaultValue;
            if (attr.attributeType == MIOAttributeType.Date) {
                let date = this.dateFormatter.dateFromString(value);
                mo.setPrimitiveValue(attr.name, date);
            }
            else {
                mo.setPrimitiveValue(attr.name, value);
            }
        }
    }

    private parseObjectRelationshipsFromNode(node:MIOIncrementalStoreNode, mo: MIOManagedObject, context?: MIOManagedObjectContext){

        let relationships = mo.entity.relationships;
        for (var i = 0; i < relationships.length; i++) {
            let rel: MIORelationshipDescription = relationships[i];

            if (rel.isToMany == false) {

                let objID:MIOManagedObjectID = this.newValueForRelationship(rel, mo.objectID, context);
                if (objID == null) continue;

                let obj:MIOManagedObject = this.relationshipObjectWithObjectID(objID, context);

                mo.willChangeValue(rel.name);
                mo.setPrimitiveValue(rel.name, obj);
                mo.didChangeValue(rel.name);
            }
            else {

                let ids = this.newValueForRelationship(rel, mo.objectID, context);
                if (ids == null) continue;

                var set:MIOSet = mo.primitiveValue(rel.name);

                for (var count = 0; count < ids.length; count++) {

                    let objID:MIOManagedObjectID = ids[count];
                    let obj:MIOManagedObject = this.relationshipObjectWithObjectID(objID, context);
                    set.addObject(obj);
                }
            }
        }
    }

    private relationshipObjectWithObjectID(objectID:MIOManagedObjectID, context:MIOManagedObjectContext){

        var obj:MIOManagedObject = this.objectsByID[objectID.identifier];
        if (obj == null) {
            // Create fault object
            let entity: MIOEntityDescription = objectID.entity;
            obj = MIOClassFromString(entity.name);
            obj.objectID = objectID;
            obj.entity = entity;            
            obj.managedObjectContext = context;
            obj.isFault = true;
            this.objectsByID[objectID.identifier] = obj;
        }

        return obj;
    }
}