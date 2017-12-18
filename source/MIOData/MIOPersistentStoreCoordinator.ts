
/// <reference path="../MIOFoundation/MIOFoundation.ts" />
/// <reference path="MIOManagedObjectModel.ts" />


class MIOPersistentStoreCoordinator extends MIOObject
{
    private _managedObjectModel:MIOManagedObjectModel = null;
    private _stores = [];
    static storeClasses = {};

    get managedObjectModel() { return this._managedObjectModel;}
    get persistentStores() {return this._stores;}

    static registerStoreClassForStoreType(storeClass:string, storeType:string){
        MIOPersistentStoreCoordinator.storeClasses[storeType] = storeClass;
    }

    initWithManagedObjectModel(model:MIOManagedObjectModel) {

        super.init();
        this._managedObjectModel = model;
    }

    addPersistentStoreWithType(type:string, configuration, url:MIOURL, options){
    
        let className = MIOPersistentStoreCoordinator.storeClasses[type];
        if (className == null) throw("PersistentStoreType doesn't exists");
        
        var ps:MIOPersistentStore = MIOClassFromString(className);
        ps.initWithPersistentStoreCoordinator(this, configuration, url, options);
        
        this._stores.push(ps);
        ps.didAddToPersistentStoreCoordinator(this);
    }

    removePersistentStore(store:MIOPersistentStore){
        store.willRemoveFromPersistentStoreCoordinator(this);
        let index = this._stores.indexOf(store);
        if (index > -1) this._stores.splice(index);
    }

    executeRequest(persistentStoreRequest:MIOPersistentStoreRequest, context:MIOManagedObjectContext){
        
        var result = [];
        for (var index = 0; index < this._stores.length; index++){
            let ps:MIOPersistentStore = this._stores[index];
            result = ps.executeRequest(persistentStoreRequest, context);
        }

        return result;
    }

    objectWithID(objectID:MIOManagedObjectID, context:MIOManagedObjectContext){
        
        for (var index = 0; index < this._stores.length; index++){
            let ps:MIOPersistentStore = this._stores[index];
            let obj = ps.objectWithID(objectID, context);
            if (obj != null) return obj;
        }

        return null;
    }
}
