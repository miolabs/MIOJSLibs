import { MIOManagedObjectID } from "./MIOManagedObjectID";
import { MIOPersistentStoreRequest } from "./MIOPersistentStoreRequest";
import { MIORelationshipDescription } from "./MIORelationshipDescription";
import { MIOPersistentStore } from "./MIOPersistentStore";
import { MIOEntityDescription } from "./MIOEntityDescription";
import { MIOManagedObjectContext } from "./MIOManagedObjectContext";
import { MIOIncrementalStoreNode } from "./MIOIncrementalStoreNode";
import { MIOManagedObject } from "./MIOManagedObject";

export class MIOIncrementalStore extends MIOPersistentStore {
    
    //
    // Can't be overriden 
    //

    newObjectIDForEntity(entity: MIOEntityDescription, referenceObject: string): MIOManagedObjectID {

        if (entity == null) throw new Error("MIOIncrementalStore: Trying to create and object ID with NULL entity");

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

    managedObjectContextDidRegisterObjectsWithIDs(objectIDs){}    
    managedObjectContextDidUnregisterObjectsWithIDs(objectIDs){}

    //
    // Methods only to be call by the framework
    //

    _executeRequest(request: MIOPersistentStoreRequest, context: MIOManagedObjectContext) {
        return this.executeRequest(request, context);
    }

    _obtainPermanentIDForObject(object:MIOManagedObject) {
        return this.obtainPermanentIDsForObjects([object])[0];
    }

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