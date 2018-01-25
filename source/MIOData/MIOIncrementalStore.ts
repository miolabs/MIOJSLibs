
/// <reference path="MIOPersistentStore.ts" />
/// <reference path="MIOIncrementalStoreNode.ts" />

class MIOIncrementalStore extends MIOPersistentStore {
    
    //TODO: Change to provate when possible
    private nodesByObjectID = {};
    private objectsByID = {};

    private dateFormatter = MIOISO8601DateFormatter.iso8601DateFormatter();

    //
    // Can't be overriden 
    //

    newObjectIDForEntity(entity: MIOEntityDescription, referenceObject: string): MIOManagedObjectID {

        if (entity == null) throw("MIOIncrementalStore: Trying to create and object ID with NULL entity");

        let objID = MIOManagedObjectID._objectIDWithEntity(entity, referenceObject);
        objID._setPersistentStore(this);
        objID._setStoreIdentifier(this.identifier);
        
        console.log("New REFID: " + referenceObject);

        return objID;
    }

    referenceObjectForObjectID(objectID: MIOManagedObjectID) {
        return objectID._getReferenceObject();
    }

    //
    // Could be overriden
    //

    executeRequest(request: MIOPersistentStoreRequest, context: MIOManagedObjectContext) {
        return [];
    }

    newValuesForObjectWithID(objectID: MIOManagedObjectID, context: MIOManagedObjectContext): MIOIncrementalStoreNode {
        return null;
    }

    newValueForRelationship(relationship: MIORelationshipDescription, objectID: MIOManagedObjectID, context?: MIOManagedObjectContext) {
        return null;
    } 

    obtainPermanentIDsForObjects(objects){        
        var array = [];
        for(var index = 0; index < objects.length; index++){
            let obj = objects[index];
            array.addObject(obj.objectID);
        }

        return array;
    }

    managedObjectContextDidRegisterObjectsWithIDs(objectIDs){

    }

    managedObjectContextDidUnregisterObjectsWithIDs(objectIDs){
        
    }

    //
    // Methods only to be call by the framework
    //

    _executeRequest(request: MIOPersistentStoreRequest, context: MIOManagedObjectContext) {
        return this.executeRequest(request, context);
    }

    _obtainPermanentIDForObject(object:MIOManagedObject) {
        return this.obtainPermanentIDsForObjects([object])[0];
    }
/*
    fetchObjectWithObjectID(objectID:MIOManagedObjectID, context:MIOManagedObjectContext){
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
            }
            this.nodesByObjectID[objectID.identifier] = node;
        }

        return obj;
    }

    storedVersionFromObject(object:MIOManagedObject, context:MIOManagedObjectContext){        
        var version = 0;
        let objID = object.objectID;
        if (this.objectsByID[objID.identifier] == null) {
            this.objectsByID[objID.identifier] = object;
            this.obtainPermanentIDsForObjects([objID]);
        }        
        let node = this.newValuesForObjectWithID(objID, context);
        return node.version;
    }

    updateObjectWithObjectID(objectID: MIOManagedObjectID, context: MIOManagedObjectContext) {
        let obj: MIOManagedObject = this.objectsByID[objectID.identifier];
        let node = this.newValuesForObjectWithID(objectID, context);
        this.fillObjectValuesFromNode(node, obj, context);        
    }

    private fillObjectValuesFromNode(node:MIOIncrementalStoreNode, object:MIOManagedObject, context:MIOManagedObjectContext) {
        
        this.parseObjectAttributesFromNode(node, object);
        this.parseObjectRelationshipsFromNode(node, object, context);
        object._version = node.version;
        object.isFault = false;
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
*/
    // Private
    _nodeForObjectID(objectID:MIOManagedObjectID, context:MIOManagedObjectContext):MIOIncrementalStoreNode {
        return this.newValuesForObjectWithID(objectID, context);        
    }

    _objectIDForEntity(entity:MIOEntityDescription, referenceObject:string){
        // TODO:Check if already exits
        return this.newObjectIDForEntity(entity, referenceObject);
    }

    _fetchObjectWithObjectID(objectID:MIOManagedObjectID, context:MIOManagedObjectContext){
        // TODO: Make an normal query with object ID
        // HACK: Now I override in subclass, not compatible with iOS
    }
}