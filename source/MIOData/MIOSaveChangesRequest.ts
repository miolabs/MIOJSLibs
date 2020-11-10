import { MIOManagedObjectSet } from "./MIOManagedObjectSet";
import { MIOPersistentStoreRequest, MIORequestType } from "./MIOPersistentStoreRequest";

export class MIOSaveChangesRequest extends MIOPersistentStoreRequest {
    
    insertedObjects: MIOManagedObjectSet = null;
    updatedObjects: MIOManagedObjectSet = null;
    deletedObjects: MIOManagedObjectSet = null;

    initWithObjects(inserted, updated, deleted) {
        this.insertedObjects = inserted;
        this.updatedObjects = updated;
        this.deletedObjects = deleted;
        
        this.requestType = MIORequestType.Save;
    }
}
