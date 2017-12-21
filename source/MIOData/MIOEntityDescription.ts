
/// <reference path="../MIOFoundation/MIOFoundation.ts" />

/// <reference path="MIORelationshipDescription.ts" />

class MIOEntityDescription extends MIOObject {
    
    name:string = null;
    attributes = [];
    relationships = [];
    relationshipsByName = {};

    private serverAttributes = {};
    private serverRelationships = {};

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
        var obj:MIOManagedObject = MIOClassFromString(entityName);
        obj.initWithEntityAndInsertIntoManagedObjectContext(entity, context);

        return obj;
    }

    initWithEntityName(entityName:string) {

        super.init();
        this.name = entityName;
        this._managedObjectClassName = entityName;
    }

    addAttribute(name:string, type:MIOAttributeType, defaultValue, optional:boolean, serverName?:string, syncable?:boolean) {
        
        var attr = new MIOAttributeDescription();
        attr.initWithName(name, type, defaultValue, optional, serverName, syncable);
        this.attributes.push(attr);

        // Cache
        this.serverAttributes[name] = serverName ? serverName : name;
    }

    serverAttributeName(name){

        return this.serverAttributes[name];
    }

    addRelationship(name:string, destinationEntityName:string, toMany:boolean, serverName?:string, inverseName?:string, inverseEntity?:string) {

        var rel = new MIORelationshipDescription();
        rel.initWithName(name, destinationEntityName, toMany, serverName, inverseName, inverseEntity);
        this.relationships.push(rel);
        this.relationshipsByName[name] = rel;

        // Server cache
        this.serverRelationships[name] = serverName ? serverName : name;                
    }

    serverRelationshipName(name){

        return this.serverRelationships[name];
    }
}
