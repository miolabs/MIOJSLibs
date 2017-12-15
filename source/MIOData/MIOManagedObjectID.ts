
/// <reference path="../MIOFoundation/MIOFoundation.ts" />

/// <reference path="MIOEntityDescription.ts" />

class MIOManagedObjectID extends MIOObject {

    identifier:string;
    entity:MIOEntityDescription = null;
    persistentStore:MIOPersistentStore = null;
        
    static objectIDWithEntity(entity:MIOEntityDescription) {
        var objID = new MIOManagedObjectID();
        objID.initWithEntity(entity);
        return objID;
    }

    initWithEntity(entity:MIOEntityDescription){
        super.init();
        this.entity = entity;
        this.identifier = MIOUUID.uuid();
    }
}
