/// <reference types="miofoundation" />
/// <reference types="miodata" />
declare class MWSRequest extends MIOObject {
    url: MIOURL;
    httpMethod: string;
    body: any;
    bodyData: any;
    private headers;
    resultCode: number;
    resultData: any;
    private urlRequest;
    initWithURL(url: MIOURL, body?: any, httpMethod?: string): void;
    setHeaderValue(value: string, key: string): void;
    send(target: any, completion?: any): void;
    protected willStart(): void;
    protected didFinish(): void;
}
declare class MWSJSONRequest extends MWSRequest {
    willStart(): void;
    didFinish(): void;
}
declare class MWSPersistenStoreOperation extends MIOOperation {
    saveCount: number;
    request: MWSJSONRequest;
    dependencyIDs: any;
    responseCode: any;
    responseJSON: any;
    private delegate;
    private uploading;
    private setUploading(value);
    private uploaded;
    private setUploaded(value);
    initWithDelegate(delegate: any): void;
    start(): void;
    executing(): boolean;
    finished(): boolean;
}
declare let MWSPersistentStoreDidChangeEntityStatus: string;
declare enum MWSPersistentStoreFetchStatus {
    None = 0,
    Downloading = 1,
    Downloaded = 2,
}
declare enum MWSPersistentStoreRequestType {
    Fetch = 0,
    Insert = 1,
    Update = 2,
    Delete = 3,
}
declare enum MWSPersistentStoreError {
    NoStoreURL = 0,
    InvalidRequest = 1,
}
declare class MWSPersistentStore extends MIOIncrementalStore {
    static readonly type: string;
    readonly type: string;
    delegate: any;
    private storeURL;
    private entitiesInfo;
    private nodesByReferenceID;
    private referenceIDByObjectsID;
    private objectIDByReferenceID;
    loadMetadata(): MIOError;
    executeRequest(request: MIOPersistentStoreRequest, context: MIOManagedObjectContext): any[];
    newValuesForObjectWithID(objectID: MIOManagedObjectID, context: MIOManagedObjectContext): MIOIncrementalStoreNode;
    newValueForRelationship(relationship: MIORelationshipDescription, objectID: MIOManagedObjectID, context?: MIOManagedObjectContext): any;
    obtainPermanentIDsForObjects(objects: any): any[];
    managedObjectContextDidRegisterObjectsWithIDs(objectIDs: any): void;
    managedObjectContextDidUnregisterObjectsWithIDs(objectIDs: any): void;
    _fetchObjectWithObjectID(objectID: MIOManagedObjectID, context: MIOManagedObjectContext): void;
    private fetchingObjects;
    private fetchObjectWithServerID(serverID, entityName, context);
    fetchObjects(fetchRequest: MIOFetchRequest, context: MIOManagedObjectContext, target?: any, completion?: any): void;
    private updateObjectsInContext(items, entity, context, relationshipEntities);
    private updateObjectInContext(values, entity, context, objectID?, relationshipEntities?);
    private nodeWithServerID(serverID, entity);
    private newNodeWithValuesAtServerID(serverID, values, version, entity, objectID?);
    private updateNodeWithValuesAtServerID(serverID, values, version, entity);
    private deleteNodeAtServerID(serverID, entity);
    private partialRelationshipObjects;
    private checkRelationships(values, entity, context, relationshipEntities);
    private saveCount;
    private saveObjects(request, context?);
    insertObjectToServer(object: MIOManagedObject): void;
    private updateObjectOnServer(object);
    deleteObjectOnServer(object: MIOManagedObject): void;
    private addOperation(operation, serverID);
    private removeOperation(operation, serverID);
    operationAtServerID(serverID: string, saveCount: any): any;
    private fetchOperationQueue;
    private fetchFromServer();
    private saveOperationQueue;
    private saveOperationsByReferenceID;
    private checkOperationDependecies(operation, dependencies);
    private uploadToServer();
}
