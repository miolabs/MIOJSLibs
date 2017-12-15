
/// <reference path="../MIOFoundation/MIOFoundation.ts" />

let MIOStoreUUIDKey = "MIOStoreUUIDKey";
let MIOStoreTypeKey = "MIOStoreTypeKey";

class  MIOPersistentStore extends MIOObject
{    
    private _persistentStoreCoordinator:MIOPersistentStoreCoordinator = null;
    private _configurationName:string = null;
    private _url:MIOURL = null;
    private _options = null;

    // To override per class
    static get type ():string { return "MIOPersistentStore";}
    get type():string {return MIOPersistentStore.type;}

    metadata = null;

    initWithPersistentStoreCoordinator(root:MIOPersistentStoreCoordinator, configurationName:string, url:MIOURL, options?) {

        this._persistentStoreCoordinator = root;
        this._configurationName = configurationName;
        this._url = url;
        this._options = options;        

        this.loadMetadata();
    }    

    get persistentStoreCoordinator():MIOPersistentStoreCoordinator{
        return this._persistentStoreCoordinator;
    }

    get configurationName():string{
        return this._configurationName;
    }

    get url():MIOURL{
        return this._url;
    }

    get options(){
        return this._options;
    }

    get readOnly():boolean{
        return false;
    }

    didAddToPersistentStoreCoordinator(psc:MIOPersistentStoreCoordinator){}
    willRemoveFromPersistentStoreCoordinator(psc:MIOPersistentStoreCoordinator){}

    loadMetadata(){}

    executeRequest(persistentStoreRequest:MIOPersistentStoreRequest, context:MIOManagedObjectContext){
        
        return [];
    }

    newObjectIDForEntityWithReferenceObject(entity, referenceObject){
        
        
    }

    objectWithID(objectID:string){
        return null;
    }
}