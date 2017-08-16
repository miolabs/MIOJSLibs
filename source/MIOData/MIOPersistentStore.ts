
/// <reference path="../MIOFoundation/MIOFoundation.ts" />

const MIOPersistentStoreType = "MIOPersistentStore";

class  MIOPersistentStore extends MIOObject
{    
    private _persistentStoreCoordinator:MIOPersistentStoreCoordinator = null;
    private _configurationName:string = null;
    private _url:MIOURL = null;
    private _options = null;

    initWithPersistentStoreCoordinator(root:MIOPersistentStoreCoordinator, configurationName:string, url:MIOURL, options) {

        this._persistentStoreCoordinator = root;
        this._configurationName = configurationName;
        this._url = url;
        this._options = options;
    }    

    get type(){
        // To override
        return MIOPersistentStoreType;
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

    didAddToPersistentStoreCoordinator(psc:MIOPersistentStoreCoordinator){

    }

    willRemoveFromPersistentStoreCoordinator(psc:MIOPersistentStoreCoordinator){

    }

    loadMetadata(){

    }

    executeRequest(persistentStoreRequest:MIOPersistentStoreRequest, context:MIOManagedObjectContext){
        
        return [];
    }
}