import { MIOPersistentStoreRequest, MIORequestType } from "./MIOPersistentStoreRequest";
import { MIOEntityDescription } from "./MIOEntityDescription";
import { MIOPredicate } from "../MIOFoundation";

export enum MIOFetchRequestResultType{
    MIOManagedObject,
    MIOManagedObjectID,
    Dictionary,
    Count
}

export class MIOFetchRequest extends MIOPersistentStoreRequest {
    
    entityName:string = null;
    entity:MIOEntityDescription = null;
    predicate:MIOPredicate = null;
    sortDescriptors = null;
    resultType = MIOFetchRequestResultType.MIOManagedObject;
    fetchLimit = 0;
    fetchOffset = 0;
    relationshipKeyPathsForPrefetching = [];
    userInfo = {};

    static fetchRequestWithEntityName(entityName:string) {
        var fetch = new MIOFetchRequest();
        fetch.initWithEntityName(entityName);

        return fetch;
    }    

    initWithEntityName(entityName:string) {
        this.entityName = entityName;
        this.requestType = MIORequestType.Fetch;
    }

    copy(){
        let request = new MIOFetchRequest();
        request.initWithEntityName(this.entityName);

        request.entity = this.entity;
        request.predicate = this.predicate;
        request.sortDescriptors = this.sortDescriptors;
        request.resultType = this.resultType;
        request.fetchLimit = this.fetchLimit;
        request.fetchOffset = this.fetchOffset;
        request.relationshipKeyPathsForPrefetching = this.relationshipKeyPathsForPrefetching;
            
        return request;
    }
}
