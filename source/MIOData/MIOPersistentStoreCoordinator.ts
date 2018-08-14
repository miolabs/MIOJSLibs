import { MIOObject, MIOURL } from "../MIOFoundation";
import { MIOClassFromString } from "../MIOCore/platform";
import { MIOManagedObjectID } from "./MIOManagedObjectID";
import { MIOEntityDescription } from "./MIOEntityDescription";
import { MIOManagedObject } from "./MIOManagedObject";
import { MIOManagedObjectModel } from "./MIOManagedObjectModel";
import { MIOPersistentStore } from "./MIOPersistentStore";

export class MIOPersistentStoreCoordinator extends MIOObject
{
    private _managedObjectModel:MIOManagedObjectModel = null;
    get managedObjectModel() { return this._managedObjectModel;}

    private _storesByIdentifier = {};
    private _stores = [];    
    get persistentStores() {return this._stores;}
    static _storeClasses = {};

    static registerStoreClassForStoreType(storeClass:string, storeType:string){
        MIOPersistentStoreCoordinator._storeClasses[storeType] = storeClass;
    }

    initWithManagedObjectModel(model:MIOManagedObjectModel) {
        super.init();
        this._managedObjectModel = model;
    }

    addPersistentStoreWithType(type:string, configuration:string, url:MIOURL, options){
    
        if (type == null) {
            //TODO: Check the configuration type from store metada
            throw new Error("MIOPersistentStoreCoordinator: Unimplemeted method with type null");
        }

        let className = MIOPersistentStoreCoordinator._storeClasses[type];
        if (className == null) throw new Error("MIOPersistentStoreCoordinator: Unkown persistent store type.");
        
        var ps:MIOPersistentStore = MIOClassFromString(className);
        ps.initWithPersistentStoreCoordinator(this, configuration, url, options);
        
        this._storesByIdentifier[ps.identifier] = ps;
        this._stores.addObject(ps);
        ps.didAddToPersistentStoreCoordinator(this);

        return ps;
    }

    removePersistentStore(store:MIOPersistentStore){
        store.willRemoveFromPersistentStoreCoordinator(this);
        delete this._storesByIdentifier[store.identifier];
        this._stores.removeObject(store);
    }

    managedObjectIDForURIRepresentation(url:MIOURL):MIOManagedObjectID{
        let scheme:string = url.scheme;
        let host:string = url.host;
        let path:string = url.path;
        let reference:string = path.lastPathComponent();
        let entityName:string = path.stringByDeletingLastPathComponent().lastPathComponent();
        let model:MIOManagedObjectModel = this.managedObjectModel;
        let entity:MIOEntityDescription = model.entitiesByName[entityName];

        return this._persistentStoreWithIdentifier(host)._objectIDForEntity(entity, reference);
    }

    _persistentStoreWithIdentifier(identifier:string) {
        if (identifier == null) return null;
        return this._storesByIdentifier[identifier];
    }

    _persistentStoreForObjectID(objectID:MIOManagedObjectID):MIOPersistentStore{
        
        if (this._stores.length == 0) throw new Error("MIOPersistentStoreCoordinator: There's no stores!");
        
        let entity = objectID.entity;
        var storeIdentifier = objectID._getStoreIdentifier();
        let store = this._persistentStoreWithIdentifier(storeIdentifier);
        
        if (store != null) return store;        

        let model = this.managedObjectModel;

        for (var index = 0; index < this._stores.length; index++){
            let store:MIOPersistentStore = this._stores[index];
            let configurationName = store.configurationName;

            if (configurationName != null){
                let entities = model.entitiesForConfiguration(configurationName);
                for (var name in entities) {
                    var checkEntity = entities[name];
                    if (checkEntity === entity) return checkEntity;
                }
            }
        }

        return this._stores[0];
        
    }

    _persistentStoreForObject(object:MIOManagedObject):MIOPersistentStore{
        return this._persistentStoreForObjectID(object.objectID);    
    }
}
