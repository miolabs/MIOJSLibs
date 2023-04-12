import { MIOObject } from "../MIOFoundation";
import { MIOPropertyDescription } from "./MIOPropertyDescription";
import { MIOClassFromString } from "../MIOCore/platform";
import { MIODeleteRule, MIORelationshipDescription } from "./MIORelationshipDescription";
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

    isAbstract = false;

    private _properties = [];
    private _propertiesByName = {};

    private serverAttributes = {};
    private serverRelationships = {};

    private _managedObjectClassName = "MIOEntityDescription";
    get managedObjectClassName():string {return this._managedObjectClassName;}

    managedObjectModel:MIOManagedObjectModel = null;

    public static entityForNameInManagedObjectContext(entityName:string, context:MIOManagedObjectContext):MIOEntityDescription {
        let entity = MIOManagedObjectModel.entityForNameInManagedObjectContext(entityName, context);
        return entity;
    }

    public static insertNewObjectForEntityForName(entityName:string, context:MIOManagedObjectContext) {
        if (entityName == null) throw new Error("MIOEntityDescription:insertNewObjectForEntityForName: EntityName == null");
        
        let entity = MIOManagedObjectModel.entityForNameInManagedObjectContext(entityName, context);        
        let obj:MIOManagedObject = MIOClassFromString(entity.managedObjectClassName);
        obj.initWithEntityAndInsertIntoManagedObjectContext(entity, context);

        return obj;
    }

    initWithEntityName(entityName:string, superEntity:MIOEntityDescription, model:MIOManagedObjectModel, classname:string = null) {
        super.init();
        this.name = entityName;
        this._managedObjectClassName = classname != null ? classname : entityName;
        this.superentity = superEntity;
        this.managedObjectModel = model;
        
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
                    this.addRelationship(rel.name, rel.destinationEntityName, rel.isToMany, rel.serverName, rel.inverseRelationship.name, rel.inverseRelationship.destinationEntityName);
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

    addRelationship(name:string, destinationEntityName:string, toMany:boolean, serverName?:string, inverseName?:string, inverseEntityName?:string, optional?:boolean, deletionRule?:MIODeleteRule) {

        let rel = new MIORelationshipDescription();
        rel.initWithName(name, destinationEntityName, toMany, serverName, inverseName, inverseEntityName);
        if (optional != null) rel.optional = optional;
        if (deletionRule != null) rel.deleteRule = deletionRule;
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

    parentEntityName:string = null;
    private isBuilt = false;
    build() {

        if (this.isBuilt) { return; }
        this.isBuilt = true;
        
        if (this.parentEntityName != null) {
            let parentEntity =  this.managedObjectModel.entitiesByName[this.parentEntityName];
            this.superentity = parentEntity;
            //parentEntity.subentities.append(this);
            parentEntity.build();
            
            for (let key in parentEntity.propertiesByName) {
                let prop = parentEntity.propertiesByName[key];
                if (prop instanceof MIOAttributeDescription) {
                    let attr = prop as MIOAttributeDescription;
                    this.addAttribute(attr.name, attr.attributeType, attr.defaultValue, attr.optional);
                }
                else if (prop instanceof MIORelationshipDescription) {
                    let rel = prop as MIORelationshipDescription;
                    this.addRelationship(rel.name,rel.destinationEntityName, rel.isToMany, null, rel.inverseName, rel.inverseEntityName, rel.optional);
                }
            }
        }
        
        for (let key in this.relationshipsByName) {
            let rel = this.relationshipsByName[key] as MIORelationshipDescription;
            if (rel.destinationEntity == null) {
                rel.destinationEntity = this.managedObjectModel.entitiesByName[rel.destinationEntityName];
            }
            
            if (rel.inverseName != null && rel.inverseEntityName != null) {
                let inverseEntity = this.managedObjectModel.entitiesByName[rel.inverseEntityName];
                if (inverseEntity == null) {
                    throw new Error("KK");
                }

                let inverseRelation = inverseEntity.relationshipsByName[rel.inverseName];
                rel.inverseRelationship = inverseRelation
            }
        }
    }
}
