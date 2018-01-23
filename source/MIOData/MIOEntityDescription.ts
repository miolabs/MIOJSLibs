
/// <reference path="../MIOFoundation/MIOFoundation.ts" />

/// <reference path="MIORelationshipDescription.ts" />

class MIOEntityDescription extends MIOObject {
    
    name:string = null;
    attributes = [];
    attributesByName = {};

    relationships = [];
    relationshipsByName = {};

    private _properties = [];
    private _propertiesByName = {};

    private serverAttributes = {};
    private serverRelationships = {};

    private _managedObjectClassName = "MIOEntityDescription";
    get managedObjectClassName():string {return this._managedObjectClassName;}

    public static entityForNameInManagedObjectContext(entityName:string, context:MIOManagedObjectContext):MIOEntityDescription {
        let entity = MIOManagedObjectModel.entityForNameInManagedObjectContext(entityName, context);
        return entity;
    }

    public static insertNewObjectForEntityForName(entityName:string, context:MIOManagedObjectContext) {        
        let entity = MIOManagedObjectModel.entityForNameInManagedObjectContext(entityName, context);
        let obj:MIOManagedObject = MIOClassFromString(entityName);
        obj.initWithEntityAndInsertIntoManagedObjectContext(entity, context);

        return obj;
    }

    initWithEntityName(entityName:string) {

        super.init();
        this.name = entityName;
        this._managedObjectClassName = entityName;
    }

    get properties():Array<MIOPropertyDescription>{
        return this._properties;
    }
    
    get propertiesByName(){
        return this._propertiesByName;
    }

    addAttribute(name:string, type:MIOAttributeType, defaultValue, optional:boolean, serverName?:string, syncable?:boolean) {
        
        var attr = new MIOAttributeDescription();
        attr.initWithName(name, type, defaultValue, optional, serverName, syncable);
        this.attributes.push(attr);
        this.attributesByName[name] = attr;
        this._propertiesByName[name] = attr;
        this._properties.addObject(attr);
        
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
        this._propertiesByName[name] = rel;
        this._properties.addObject(rel);

        // Server cache
        this.serverRelationships[name] = serverName ? serverName : name;                
    }

    serverRelationshipName(name){
        return this.serverRelationships[name];
    }
}
