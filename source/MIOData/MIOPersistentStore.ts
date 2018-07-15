import { MIOObject, MIOURL, MIOUUID } from "../MIOFoundation";
import { MIOPersistentStoreRequest } from "./MIOPersistentStoreRequest";
import { MIOManagedObject } from "./MIOManagedObject";
import { MIOEntityDescription } from "./MIOEntityDescription";
import { MIOPersistentStoreCoordinator } from "./MIOPersistentStoreCoordinator";
import { MIOManagedObjectContext } from "./MIOManagedObjectContext";
import { MIOManagedObjectID } from "./MIOManagedObjectID";

export let MIOStoreUUIDKey = "MIOStoreUUIDKey";
export let MIOStoreTypeKey = "MIOStoreTypeKey";

export class MIOPersistentStore extends MIOObject
{    
    // To override per class
    static get type ():string { return "MIOPersistentStore";}

    private _persistentStoreCoordinator:MIOPersistentStoreCoordinator = null;
    get persistentStoreCoordinator():MIOPersistentStoreCoordinator{return this._persistentStoreCoordinator;}

    private _configurationName:string = null;
    get configurationName():string{return this._configurationName;}
    
    private _url:MIOURL = null;
    get url():MIOURL{return this._url;}
    
    private _options = null;    
    get options(){return this._options;}

    get readOnly():boolean{return false;}
    
    private _type:string = null;
    get type():string {return this._type;}

    private _identifier:string = null;
    get identifier(){return this._identifier;}

    protected metadata = null;

    initWithPersistentStoreCoordinator(root:MIOPersistentStoreCoordinator, configurationName:string, url:MIOURL, options?) {

        this._persistentStoreCoordinator = root;
        this._configurationName = configurationName;
        this._url = url;
        this._options = options;        

        this.loadMetadata();
        this._identifier = this.metadata[MIOStoreUUIDKey];
        this._type = this.metadata[MIOStoreTypeKey];

        if (this._identifier == null || this._type == null) {
            throw new Error("MIOPersistentStore: Invalid metada information");
        }
    }    

    didAddToPersistentStoreCoordinator(psc:MIOPersistentStoreCoordinator){}
    willRemoveFromPersistentStoreCoordinator(psc:MIOPersistentStoreCoordinator){}

    loadMetadata(){
        let uuid = MIOUUID.UUID().UUIDString;
        let metadata = { MIOStoreUUIDKey: uuid, MIOStoreTypeKey: "MIOPersistentStore" };
        this.metadata = metadata;        
    }

    _obtainPermanentIDForObject(object:MIOManagedObject):MIOManagedObjectID {
        return object.objectID;
    }        

    _executeRequest(request: MIOPersistentStoreRequest, context: MIOManagedObjectContext) {
        return [];
    }

    _objectIDForEntity(entity:MIOEntityDescription, referenceObject:string){
        return null;
    }
}