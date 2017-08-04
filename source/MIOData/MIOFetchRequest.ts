
/// <reference path="MIOPersistentStoreRequest.ts" />

enum MIOFetchRequestResultType{
    MIOManagedObject,
    MIOManagedObjectID,
    Dictionary,
    Count
}

class MIOFetchRequest extends MIOPersistentStoreRequest {
    
    entityName = null;
    predicate = null;
    sortDescriptors = null;
    resultType = MIOFetchRequestResultType.MIOManagedObject;

    static fetchRequestWithEntityName(name) {
        var fetch = new MIOFetchRequest();
        fetch.initWithEntityName(name);

        return fetch;
    }    

    initWithEntityName(name) {
        this.entityName = name;
        this.requestType = MIORequestType.Fetch;
    }
}
