import { MIOObject } from "../MIOFoundation";
import { MIOPropertyDescription } from "./MIOPropertyDescription";
import { MIOClassFromString } from "../MIOCore/platform";
import { MIORelationshipDescription } from "./MIORelationshipDescription";
import { MIOManagedObjectModel } from "./MIOManagedObjectModel";
import { MIOManagedObject } from "./MIOManagedObject";
import { MIOAttributeType, MIOAttributeDescription } from "./MIOAttributeDescription";
import { MIOManagedObjectContext } from "./MIOManagedObjectContext";

export class MIOEntityDescription extends MIOObject {
    
    name:string = null;
    attributes = [];
    attributesByName = {};

    relationships = [];
    relationshipsByName = {};

    superentity:MIOEntityDescription = null;

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
        if (entityName == null) throw new Error("MIOEntityDescription:insertNewObjectForEntityForName: EntityName == null");
        let obj:MIOManagedObject = MIOClassFromString(entityName);
        obj.initWithEntityAndInsertIntoManagedObjectContext(entity, context);

        return obj;
    }

    initWithEntityName(entityName:string, superEntity?:MIOEntityDescription) {
        super.init();
        this.name = entityName;
        this._managedObjectClassName = entityName;
        this.superentity = superEntity;
        
        if (superEntity == null) return;
        
        // Add all attributes and relationshsip from parent
        let properties = superEntity.properties;
        for (let index = 0; index < properties.length; index++){
            let property = properties[index] as MIOPropertyDescription;
            if (property instanceof MIOAttributeDescription) {
                let attr = property as MIOAttributeDescription;
                this.addAttribute(attr.name, attr.attributeType, attr.defaultValue, attr.optional, attr.serverName, attr.syncable);
            }
            else if (property instanceof MIORelationshipDescription){
                let rel = property as MIORelationshipDescription;
                if (rel.inverseRelationship != null) {
                    this.addRelationship(rel.name, rel.destinationEntityName, rel.isToMany, rel.serverName, rel.inverseRelationship.name, rel.inverseRelationship.entity.name);
                }
                else {
                    this.addRelationship(rel.name, rel.destinationEntityName, rel.isToMany, rel.serverName);
                }
            }
        }
    }

    get properties():MIOPropertyDescription[]{
        return this._properties;
    }
    
    get propertiesByName(){
        return this._propertiesByName;
    }

    addAttribute(name:string, type:MIOAttributeType, defaultValue, optional:boolean, serverName?:string, syncable?:boolean) {
        
        let attr = new MIOAttributeDescription();
        attr.initWithName(name, type, defaultValue, optional, serverName, syncable);
        this.attributes.push(attr);
        this.attributesByName[name] = attr;
        this._propertiesByName[name] = attr;
        this._properties.addObject(attr);
        
        // Cache        
        this.serverAttributes[name] = serverName ? serverName : name;
    }

    addRelationship(name:string, destinationEntityName:string, toMany:boolean, serverName?:string, inverseName?:string, inverseEntity?:string) {

        let rel = new MIORelationshipDescription();
        rel.initWithName(name, destinationEntityName, toMany, serverName, inverseName, inverseEntity);
        this.relationships.push(rel);
        this.relationshipsByName[name] = rel;
        this._propertiesByName[name] = rel;
        this._properties.addObject(rel);

        // Server cache
        this.serverRelationships[name] = serverName ? serverName : name;                
    }

    serverAttributeName(name){
        return this.serverAttributes[name];
    }

    serverRelationshipName(name){
        return this.serverRelationships[name];
    }
}
