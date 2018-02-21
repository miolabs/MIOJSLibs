/// <reference types="miofoundation" />
declare class MIOPropertyDescription extends MIOObject {
    entity: MIOEntityDescription;
    name: string;
    optional: boolean;
}
declare enum MIOAttributeType {
    Undefined = 0,
    Boolean = 1,
    Integer = 2,
    Float = 3,
    Number = 4,
    String = 5,
    Date = 6,
}
declare class MIOAttributeDescription extends MIOPropertyDescription {
    private _attributeType;
    private _defaultValue;
    private _serverName;
    private _syncable;
    initWithName(name: string, type: MIOAttributeType, defaultValue: any, optional: boolean, serverName?: string, syncable?: boolean): void;
    readonly attributeType: MIOAttributeType;
    readonly defaultValue: any;
    readonly serverName: string;
    readonly syncable: boolean;
}
declare enum MIODeleteRule {
    noActionDeleteRule = 0,
    nullifyDeleteRule = 1,
    cascadeDeleteRule = 2,
    denyDeleteRule = 3,
}
declare class MIORelationshipDescription extends MIOPropertyDescription {
    destinationEntityName: string;
    destinationEntity: MIOEntityDescription;
    inverseRelationship: MIORelationshipDescription;
    isToMany: boolean;
    deleteRule: MIODeleteRule;
    private _serverName;
    initWithName(name: string, destinationEntityName: string, isToMany: boolean, serverName?: string, inverseName?: string, inverseEntity?: string): void;
    readonly serverName: string;
}
declare class MIOEntityDescription extends MIOObject {
    name: string;
    attributes: any[];
    attributesByName: {};
    relationships: any[];
    relationshipsByName: {};
    private _properties;
    private _propertiesByName;
    private serverAttributes;
    private serverRelationships;
    private _managedObjectClassName;
    readonly managedObjectClassName: string;
    static entityForNameInManagedObjectContext(entityName: string, context: MIOManagedObjectContext): MIOEntityDescription;
    static insertNewObjectForEntityForName(entityName: string, context: MIOManagedObjectContext): MIOManagedObject;
    initWithEntityName(entityName: string): void;
    readonly properties: Array<MIOPropertyDescription>;
    readonly propertiesByName: {};
    addAttribute(name: string, type: MIOAttributeType, defaultValue: any, optional: boolean, serverName?: string, syncable?: boolean): void;
    serverAttributeName(name: any): any;
    addRelationship(name: string, destinationEntityName: string, toMany: boolean, serverName?: string, inverseName?: string, inverseEntity?: string): void;
    serverRelationshipName(name: any): any;
}
declare enum MIORequestType {
    Fetch = 0,
    Save = 1,
}
declare class MIOPersistentStoreRequest extends MIOObject {
    requestType: MIORequestType;
}
declare enum MIOFetchRequestResultType {
    MIOManagedObject = 0,
    MIOManagedObjectID = 1,
    Dictionary = 2,
    Count = 3,
}
declare class MIOFetchRequest extends MIOPersistentStoreRequest {
    entityName: string;
    entity: MIOEntityDescription;
    predicate: MIOPredicate;
    sortDescriptors: any;
    resultType: MIOFetchRequestResultType;
    fetchLimit: number;
    fetchOffset: number;
    relationshipKeyPathsForPrefetching: any[];
    static fetchRequestWithEntityName(entityName: string): MIOFetchRequest;
    initWithEntityName(entityName: string): void;
}
declare class MIOManagedObjectID extends MIOObject {
    private _entity;
    readonly entity: MIOEntityDescription;
    private _isTemporaryID;
    readonly isTemporaryID: boolean;
    private _persistentStore;
    readonly persistentStore: MIOPersistentStore;
    readonly URIRepresentation: MIOURL;
    static _objectIDWithEntity(entity: MIOEntityDescription, referenceObject?: string): MIOManagedObjectID;
    static _objectIDWithURIRepresentation(url: MIOURL): MIOManagedObjectID;
    _initWithEntity(entity: MIOEntityDescription, referenceObject?: string): void;
    _initWithURIRepresentation(url: MIOURL): void;
    private _storeIdentifier;
    _getStoreIdentifier(): string;
    _setStoreIdentifier(identifier: string): void;
    _setPersistentStore(persistentStore: MIOPersistentStore): void;
    private _referenceObject;
    _getReferenceObject(): any;
    _setReferenceObject(object: any): void;
}
declare class MIOManagedObjectSet extends MIOObject {
    static _setWithManagedObject(object: MIOManagedObject, relationship: MIORelationshipDescription): MIOManagedObjectSet;
    private mo;
    private relationship;
    private objectIDs;
    private relationshipFault;
    init(): void;
    _initWithManagedObject(object: MIOManagedObject, relationship: MIORelationshipDescription): void;
    _addObjectID(objectID: MIOManagedObjectID): void;
    addObject(object: MIOManagedObject): void;
    _removeObject(objectID: MIOManagedObjectID): void;
    removeObject(object: MIOManagedObject): void;
    removeAllObjects(): void;
    indexOfObject(object: MIOManagedObject): any;
    containsObject(object: MIOManagedObject): boolean;
    objectAtIndex(index: any): any;
    private objects;
    readonly allObjects: any;
    readonly count: number;
    readonly length: number;
    filterWithPredicate(predicate: MIOPredicate): any;
    addObserver(obs: any, keypath: string, context?: any): void;
    _reset(): void;
}
declare class MIOManagedObject extends MIOObject {
    init(): void;
    _initWithObjectID(objectID: MIOManagedObjectID, context: MIOManagedObjectContext): void;
    initWithEntityAndInsertIntoManagedObjectContext(entity: MIOEntityDescription, context: MIOManagedObjectContext): void;
    private setDefaultValues();
    private _objectID;
    readonly objectID: MIOManagedObjectID;
    readonly entity: MIOEntityDescription;
    private _managedObjectContext;
    readonly managedObjectContext: MIOManagedObjectContext;
    readonly hasChanges: boolean;
    private _isInserted;
    readonly isInserted: boolean;
    _setIsInserted(value: boolean): void;
    private _isUpdated;
    readonly isUpdated: boolean;
    _setIsUpdated(value: boolean): void;
    private _isDeleted;
    readonly isDeleted: boolean;
    _setIsDeleted(value: boolean): void;
    private _isFault;
    readonly isFault: boolean;
    _setIsFault(value: boolean): void;
    awakeFromInsert(): void;
    awakeFromFetch(): void;
    _version: number;
    private _changedValues;
    readonly changedValues: {};
    private _storedValues;
    private committedValues();
    private storeValuesFromIncrementalStore(store);
    committedValuesForKeys(keys: any): any;
    willSave(): void;
    didSave(): void;
    willTurnIntoFault(): void;
    didTurnIntoFault(): void;
    willAccessValueForKey(key: string): void;
    didAccessValueForKey(key: string): void;
    valueForKey(key: string): any;
    setValueForKey(value: any, key: string): void;
    primitiveValueForKey(key: string): any;
    setPrimitiveValueForKey(value: any, key: string): void;
    _addObjectForKey(object: any, key: string): void;
    _removeObjectForKey(object: any, key: string): void;
    _didCommit(): void;
}
declare class MIOManagedObjectModel extends MIOObject {
    private _entitiesByName;
    private _entitiesByConfigName;
    static entityForNameInManagedObjectContext(entityName: any, context: MIOManagedObjectContext): MIOEntityDescription;
    initWithContentsOfURL(url: MIOURL): void;
    connectionDidReceiveText(urlConnection: any, text: any): void;
    private currentEntity;
    private currentConfigName;
    parserDidStartElement(parser: MIOXMLParser, element: string, attributes: any): void;
    parserDidEndElement(parser: MIOXMLParser, element: string): void;
    parserDidEndDocument(parser: MIOXMLParser): void;
    private _addAttribute(name, type, optional, serverName, syncable, defaultValueString);
    private _addRelationship(name, destinationEntityName, toMany, serverName, inverseName, inverseEntity);
    private _setEntityForConfiguration(entity, configuration);
    setEntitiesForConfiguration(entities: any, configuration: string): void;
    entitiesForConfiguration(configurationName: string): any;
    readonly entitiesByName: {};
}
declare class MIOPersistentStoreCoordinator extends MIOObject {
    private _managedObjectModel;
    readonly managedObjectModel: MIOManagedObjectModel;
    private _storesByIdentifier;
    private _stores;
    readonly persistentStores: any[];
    static _storeClasses: {};
    static registerStoreClassForStoreType(storeClass: string, storeType: string): void;
    initWithManagedObjectModel(model: MIOManagedObjectModel): void;
    addPersistentStoreWithType(type: string, configuration: string, url: MIOURL, options: any): MIOPersistentStore;
    removePersistentStore(store: MIOPersistentStore): void;
    managedObjectIDForURIRepresentation(url: MIOURL): MIOManagedObjectID;
    _persistentStoreWithIdentifier(identifier: string): any;
    _persistentStoreForObjectID(objectID: MIOManagedObjectID): MIOPersistentStore;
    _persistentStoreForObject(object: MIOManagedObject): MIOPersistentStore;
}
declare let MIOStoreUUIDKey: string;
declare let MIOStoreTypeKey: string;
declare class MIOPersistentStore extends MIOObject {
    static readonly type: string;
    private _persistentStoreCoordinator;
    readonly persistentStoreCoordinator: MIOPersistentStoreCoordinator;
    private _configurationName;
    readonly configurationName: string;
    private _url;
    readonly url: MIOURL;
    private _options;
    readonly options: any;
    readonly readOnly: boolean;
    private _type;
    readonly type: string;
    private _identifier;
    readonly identifier: string;
    protected metadata: any;
    initWithPersistentStoreCoordinator(root: MIOPersistentStoreCoordinator, configurationName: string, url: MIOURL, options?: any): void;
    didAddToPersistentStoreCoordinator(psc: MIOPersistentStoreCoordinator): void;
    willRemoveFromPersistentStoreCoordinator(psc: MIOPersistentStoreCoordinator): void;
    loadMetadata(): void;
    _obtainPermanentIDForObject(object: MIOManagedObject): MIOManagedObjectID;
    _executeRequest(request: MIOPersistentStoreRequest, context: MIOManagedObjectContext): any[];
    _objectIDForEntity(entity: MIOEntityDescription, referenceObject: string): any;
}
declare let MIOManagedObjectContextWillSaveNotification: string;
declare let MIOManagedObjectContextDidSaveNotification: string;
declare let MIOManagedObjectContextObjectsDidChange: string;
declare let MIOInsertedObjectsKey: string;
declare let MIOUpdatedObjectsKey: string;
declare let MIODeletedObjectsKey: string;
declare let MIORefreshedObjectsKey: string;
declare enum MIOManagedObjectContextConcurrencyType {
    PrivateQueue = 0,
    MainQueue = 1,
}
declare enum NSMergePolicy {
    None = 0,
}
declare class MIOManagedObjectContext extends MIOObject {
    persistentStoreCoordinator: MIOPersistentStoreCoordinator;
    concurrencyType: MIOManagedObjectContextConcurrencyType;
    mergePolicy: string;
    private _parent;
    private managedObjectChanges;
    private objectsByEntity;
    private objectsByID;
    private insertedObjects;
    private updatedObjects;
    private deletedObjects;
    private blockChanges;
    initWithConcurrencyType(type: MIOManagedObjectContextConcurrencyType): void;
    parent: MIOManagedObjectContext;
    private registerObjects;
    private _registerObject(object);
    private _unregisterObject(object);
    insertObject(object: MIOManagedObject): void;
    updateObject(object: MIOManagedObject): void;
    deleteObject(object: MIOManagedObject): void;
    _objectWithURIRepresentationString(urlString: string): any;
    objectWithID(objectID: MIOManagedObjectID): MIOManagedObject;
    existingObjectWithID(objectID: MIOManagedObjectID): MIOManagedObject;
    refreshObject(object: MIOManagedObject, mergeChanges: boolean): void;
    private addObjectToTracking(objectTracking, object);
    private removeObjectFromTracking(objectTracking, object);
    removeAllObjectsForEntityName(entityName: any): void;
    executeFetch(request: any): any;
    _obtainPermanentIDForObject(object: MIOManagedObject): void;
    save(): void;
    mergeChangesFromContextDidSaveNotification(notification: MIONotification): void;
    performBlockAndWait(target: any, block: any): void;
}
declare class MIOSaveChangesRequest extends MIOPersistentStoreRequest {
    insertedObjects: any[];
    updatedObjects: any[];
    deletedObjects: any[];
    initWithObjects(inserted: any, updated: any, deleted: any): void;
}
declare class MIOInMemoryStore extends MIOPersistentStore {
}
declare class _MIOIncrementalStoreNodeDateTransformer {
    static sdf: MIOISO8601DateFormatter;
}
declare class MIOIncrementalStoreNode extends MIOObject {
    private _objectID;
    readonly objectID: MIOManagedObjectID;
    private _version;
    readonly version: number;
    initWithObjectID(objectID: MIOManagedObjectID, values: any, version: any): void;
    updateWithValues(values: any, version: any): void;
    private _values;
    valueForPropertyDescription(property: MIOPropertyDescription): any;
}
declare class MIOIncrementalStore extends MIOPersistentStore {
    newObjectIDForEntity(entity: MIOEntityDescription, referenceObject: string): MIOManagedObjectID;
    referenceObjectForObjectID(objectID: MIOManagedObjectID): any;
    executeRequest(request: MIOPersistentStoreRequest, context: MIOManagedObjectContext): any[];
    newValuesForObjectWithID(objectID: MIOManagedObjectID, context: MIOManagedObjectContext): MIOIncrementalStoreNode;
    newValueForRelationship(relationship: MIORelationshipDescription, objectID: MIOManagedObjectID, context?: MIOManagedObjectContext): any;
    obtainPermanentIDsForObjects(objects: any): any[];
    managedObjectContextDidRegisterObjectsWithIDs(objectIDs: any): void;
    managedObjectContextDidUnregisterObjectsWithIDs(objectIDs: any): void;
    _executeRequest(request: MIOPersistentStoreRequest, context: MIOManagedObjectContext): any[];
    _obtainPermanentIDForObject(object: MIOManagedObject): any;
    _nodeForObjectID(objectID: MIOManagedObjectID, context: MIOManagedObjectContext): MIOIncrementalStoreNode;
    _objectIDForEntity(entity: MIOEntityDescription, referenceObject: string): MIOManagedObjectID;
    _fetchObjectWithObjectID(objectID: MIOManagedObjectID, context: MIOManagedObjectContext): void;
}
declare class MIOFetchSection extends MIOObject {
    objects: any[];
    numberOfObjects(): number;
}
declare class MIOFetchedResultsController extends MIOObject {
    sections: any[];
    resultObjects: any[];
    fetchRequest: MIOFetchRequest;
    managedObjectContext: MIOManagedObjectContext;
    sectionNameKeyPath: any;
    private registerObjects;
    initWithFetchRequest(request: any, managedObjectContext: any, sectionNameKeyPath?: any): void;
    private _delegate;
    delegate: any;
    performFetch(): any[];
    private processObject(object);
    private checkObjects(objects);
    private refreshObjects(objects);
    private updateContent(inserted, updated, deleted);
    private _notify();
    private _splitInSections();
    objectAtIndexPath(indexPath: MIOIndexPath): any;
}
declare class MIOMergePolicy extends MIOObject {
}
