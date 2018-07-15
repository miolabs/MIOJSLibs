import { MIOObject, MIOURL, MIOUUID, MIOLog } from "../MIOFoundation";
import { MIOPersistentStore } from "./MIOPersistentStore";
import { MIOEntityDescription } from "./MIOEntityDescription";

export class MIOManagedObjectID extends MIOObject {
        
    private _entity:MIOEntityDescription = null;
    get entity():MIOEntityDescription{return this._entity;}

    private _isTemporaryID = false;
    get isTemporaryID():boolean {return this._isTemporaryID;}
    
    private _persistentStore:MIOPersistentStore = null;
    get persistentStore():MIOPersistentStore{return this._persistentStore;}
    
    get URIRepresentation():MIOURL {
        let path = this.entity.name.stringByAppendingPathComponent(this._referenceObject);
        let host = this._isTemporaryID ? "" : this._storeIdentifier;
        
        var url = new MIOURL();
        url.initWithScheme("x-coredata", host, path);
        
        return url;
    }

    // #region Private methods    

    static _objectIDWithEntity(entity:MIOEntityDescription, referenceObject?:string) {
        var objID = new MIOManagedObjectID();
        objID._initWithEntity(entity, referenceObject);
        return objID;
    }

    static _objectIDWithURIRepresentation(url:MIOURL){
        var objID = new MIOManagedObjectID();
        objID._initWithURIRepresentation(url);
        return objID;
    }
    
    _initWithEntity(entity:MIOEntityDescription, referenceObject?:string){
        super.init();
        this._entity = entity;
        if (referenceObject == null) {
            this._isTemporaryID = true;
            this._referenceObject = MIOUUID.UUID().UUIDString;
        }
        else {
            this._setReferenceObject(referenceObject);
            MIOLog("ManagedObjectID create " + entity.name + "/" + referenceObject);
        }
    }

    _initWithURIRepresentation(url:MIOURL){
        super.init();
        //TODO:
    }

    private _storeIdentifier:string = null;
    _getStoreIdentifier(){return this._storeIdentifier;}
    _setStoreIdentifier(identifier:string){ this._storeIdentifier = identifier;}
    
    _setPersistentStore(persistentStore:MIOPersistentStore){this._persistentStore = persistentStore;}
    
    private _referenceObject = null;
    _getReferenceObject(){return this._referenceObject;}
    _setReferenceObject(object){
        this._isTemporaryID = false;
        this._referenceObject = object;

        if (typeof(object) != "string") {
            MIOLog("kkk");
        }
    }
    
    // #endregion
}
