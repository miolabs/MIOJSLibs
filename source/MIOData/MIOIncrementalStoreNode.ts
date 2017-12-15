/// <reference path="../MIOFoundation/MIOFoundation.ts" />

class MIOIncrementalStoreNode extends MIOObject {

    objectID:MIOManagedObjectID = null;
    values = null;
    version = 0;

    object:MIOManagedObject = null;

    initWithObjectID(objectID:MIOManagedObjectID, values, version){
        this.objectID = objectID;
        this.values = values;
        this.version = version;
    }

    updateWithValues(values, version) {
        this.values = values;
        this.version = version;
    }

    valueForPropertyDescription(prop:MIOPropertyDescription) {
        return null;
    }
}