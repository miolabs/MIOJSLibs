
/// <reference path="../MIOFoundation/MIOFoundation.ts" />

class MIOEntityDescription extends MIOObject {
    
    name = null;
    attributes = [];

    private _managedObjectClassName = "MIOManagedObject";
    get managedObjectClassName():string {return this._managedObjectClassName;}

    public static entityForNameInManagedObjectContext(entityName:string, context:MIOManagedObjectContext):MIOEntityDescription {

        //var mom = context.persistentStoreCoordinator.managedObjectModel;
        //var entity = mom.entitiesByName[entityName];

        var entity = MIOManagedObjectModel.entityForNameInManagedObjectContext(entityName, context);
        return entity;
    }

    public static insertNewObjectForEntityForName(entityName:string, context:MIOManagedObjectContext) {
        
        // var mom = context.persistentStoreCoordinator.managedObjectModel;
        // var entity = mom.entitiesByName[entityName];
                
        var entity = MIOManagedObjectModel.entityForNameInManagedObjectContext(entityName, context);
        var obj = MIOClassFromString(entityName);
        obj.initWithEntityAndInsertIntoManagedObjectContext(entity, context);

        return obj;
    }

    initWithEntityName(entityName:string) {

        super.init();
        this._managedObjectClassName = entityName;
    }

    addAttribute(name:string, type:MIOAttributeType, defaultValue, serverName?:string) {
        
        var attr = new MIOAttributeDescription();
        attr.initWithName(name, type, defaultValue, serverName);

        this.attributes.push(attr);
    }

    addRelationship(name:string) {

    }
}
