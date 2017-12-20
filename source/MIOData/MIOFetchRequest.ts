
/// <reference path="MIOPersistentStoreRequest.ts" />

enum MIOFetchRequestResultType{
    MIOManagedObject,
    MIOManagedObjectID,
    Dictionary,
    Count
}

class MIOFetchRequest extends MIOPersistentStoreRequest {
    
    entityName:string = null;
    entity:MIOEntityDescription = null;
    predicate:MIOPredicate = null;
    sortDescriptors = null;
    resultType = MIOFetchRequestResultType.MIOManagedObject;
    fetchLimit = 0;
    fetchOffset = 0;
    relationshipKeyPathsForPrefetching = [];

    static fetchRequestWithEntityName(entityName:string) {
        var fetch = new MIOFetchRequest();
        fetch.initWithEntityName(entityName);

        return fetch;
    }    

    initWithEntityName(entityName:string) {
        this.entityName = entityName;
        this.requestType = MIORequestType.Fetch;
    }
}
