import { MIOPersistentStoreRequest, MIORequestType } from "./MIOPersistentStoreRequest";

export class MIOSaveChangesRequest extends MIOPersistentStoreRequest {
    
    insertedObjects = [];
    updatedObjects = [];
    deletedObjects = [];

    initWithObjects(inserted, updated, deleted) {
        this.insertedObjects = inserted;
        this.updatedObjects = updated;
        this.deletedObjects = deleted;
        
        this.requestType = MIORequestType.Save;
    }
}
