
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

        let objID = MIOManagedObjectID.objectIDWithEntity(entity);
        objID.persistentStore = this;
        this.referenceObjectByObjectID[objID.identifier] = referenceObject;

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

    existingObjectWithID(objectID: MIOManagedObjectID, context: MIOManagedObjectContext) {
        let obj: MIOManagedObject = this.objectsByID[objectID.identifier];
        if (obj == null) {
            let node = this.newValuesForObjectWithID(objectID, context);
            if (node == null) throw("MIOIncrementalStore: Node CAN NOT BE NULL");
            if (this.nodesByObjectID[objectID.identifier] == null) {                                            
                let entity: MIOEntityDescription = objectID.entity;                
                obj = MIOClassFromString(entity.name);
                obj.objectID = objectID;
                obj.initWithEntityAndInsertIntoManagedObjectContext(entity, context);
                obj.isFault = false;
                this.objectsByID[objectID.identifier] = obj;
            }
            this.nodesByObjectID[objectID.identifier] = node;
        }
        else {
            context.updateObject(obj);
        }

        return obj;
    }

    refreshObject(object: MIOManagedObject, context: MIOManagedObjectContext, version): number {

        let objID = object.objectID;
        let node = this.nodesByObjectID[objID.identifier];

        if (node.version <= version) return version;

        this.parseAttributes(node.objectID.entity.attributes, node.values, object);
        //TODO: Parse relationships

        return node.version;
    }

    private parseAttributes(attributes, values, mo: MIOManagedObject) {

        for (var i = 0; i < attributes.length; i++) {
            let attr: MIOAttributeDescription = attributes[i];
            this.parseValueForAttribute(attr, values[attr.serverName], mo);
        }
    }

    private parseValueForAttribute(attribute: MIOAttributeDescription, value, object: MIOManagedObject) {

        if (value == null && attribute.optional == false && attribute.defaultValue == null) {
            throw ("MIOWebPersistentStore: Couldn't set attribute value (" + object.className + "." + attribute.name + "). Value is nil and it's not optional.");
        }

        if (value == null && attribute.defaultValue != null) value = attribute.defaultValue;
        let type = attribute.attributeType;

        if (type == MIOAttributeType.Boolean) {
            if (typeof (value) === "boolean") {
                object.setPrimitiveValue(attribute.name, value);
            }
            else if (typeof (value) === "string") {
                let lwValue = value.toLocaleLowerCase();
                if (lwValue == "yes" || lwValue == "true" || lwValue == "1")
                    object.setPrimitiveValue(attribute.name, true);
                else
                    object.setPrimitiveValue(attribute.name, false);
            }
            else {
                let v = value > 0 ? true : false;
                object.setPrimitiveValue(attribute.name, v);
            }
        }
        else if (type == MIOAttributeType.Integer) {
            object.setPrimitiveValue(attribute.name, parseInt(value));
        }
        else if (type == MIOAttributeType.Float || type == MIOAttributeType.Number) {
            object.setPrimitiveValue(attribute.name, parseFloat(value));
        }
        else if (type == MIOAttributeType.String) {
            object.setPrimitiveValue(attribute.name, value);
        }
        else if (type == MIOAttributeType.Date) {
            object.setPrimitiveValue(attribute.name, this.dateFormatter.dateFromString(value));
        }
    }
}