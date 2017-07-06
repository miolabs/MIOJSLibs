
/// <reference path="../MIOFoundation/MIOFoundation.ts" />
/// <reference path="MIOManagedObjectModel.ts" />

class MIOPersistentStoreCoordinator extends MIOObject
{
    private _managedObjectModel:MIOManagedObjectModel = null;

    initWithManagedObjectModel(model:MIOManagedObjectModel) {

        super.init();
        this._managedObjectModel = model;
    }

    get managedObjectModel() {
        return this._managedObjectModel;
    }
}
