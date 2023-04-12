import { MIOObject, MIOSet } from "../MIOFoundation";
import { MIOManagedObjectID } from "./MIOManagedObjectID";
import { MIOManagedObjectContext } from "./MIOManagedObjectContext";
import { MIOEntityDescription } from "./MIOEntityDescription";
import { MIOIncrementalStore } from "./MIOIncrementalStore";
import { MIOAttributeDescription } from "./MIOAttributeDescription";
import { MIODeleteRule, MIORelationshipDescription } from "./MIORelationshipDescription";
import { MIOManagedObjectSet } from "./MIOManagedObjectSet";
import { MIOManagedObjectModel } from "./MIOManagedObjectModel";

/**
 * Created by godshadow on 23/03/2017.
 */


export class MIOManagedObject extends MIOObject {        

    init(){
        throw new Error("MIOManagedObject: Can't initialize an MIOManagedObject with -init");
    }

    _initWithObjectID(objectID:MIOManagedObjectID, context:MIOManagedObjectContext) {

        //super.init();
        this._objectID = objectID;
        this._managedObjectContext = context;
        this._isFault = true;
        this._storedValues = null;

        this.awakeFromFetch();

        //MIOLog("ManagedObject create: " + this.entity.name + "/" + this.objectID._getReferenceObject());
    }

    initWithEntityAndInsertIntoManagedObjectContext(entity:MIOEntityDescription, context:MIOManagedObjectContext){        
        
        let objectID = MIOManagedObjectID._objectIDWithEntity(entity);
        this._initWithObjectID(objectID, context);

        context.insertObject(this);        
        this.setDefaultValues();

        this.awakeFromInsert();

        //MIOLog("ManagedObject ins create: " + this.entity.name + "/" + this.objectID._getReferenceObject());                  
    }

    private setDefaultValues(){
        let attributes = this.entity.attributesByName;
        for(let key in attributes) {
            let attr = attributes[key];
            let value = attr.defaultValue;

            if (value == null) continue;

            this.setValueForKey(value, key);
        }
    }
    
    private _objectID:MIOManagedObjectID = null;    
    get objectID():MIOManagedObjectID {return this._objectID;}
    get entity():MIOEntityDescription {return this.objectID.entity;}

    private _managedObjectContext:MIOManagedObjectContext = null;
    get managedObjectContext():MIOManagedObjectContext {return this._managedObjectContext;}

    get hasChanges():boolean {return (this._isInserted || this._isUpdated || this._isDeleted);}

    private _isInserted = false;
    get isInserted():boolean {return this._isInserted;}
    _setIsInserted(value:boolean) {
        this.willChangeValue("hasChanges");
        this.willChangeValue("isInserted");
        this._isInserted = value;        
        this.didChangeValue("isInserted");
        this.didChangeValue("hasChanges");
    }    

    private _isUpdated = false;
    get isUpdated():boolean {return this._isUpdated;}
    _setIsUpdated(value:boolean) {
        this.willChangeValue("hasChanges");
        this.willChangeValue("isUpdated");
        this._isUpdated = value;
        this.didChangeValue("isUpdated");
        this.didChangeValue("hasChanges");
    }
    
    private _isDeleted = false;
    get isDeleted():boolean {return this._isDeleted;}
    _setIsDeleted(value:boolean) {
        this.willChangeValue("hasChanges");
        this.willChangeValue("isDeleted");
        this._isDeleted = value;
        this.deleteInverseRelationships();
        this.didChangeValue("isDeleted");
        this.didChangeValue("hasChanges");        
    }
    
    private _isFault = false;
    get isFault():boolean {return this._isFault;}
    _setIsFault(value:boolean) {
        if (value == this._isFault) return;
        this.willChangeValue("hasChanges");
        this.willChangeValue("isFault");
        this._isFault = value;
        if (value == true) this._storedValues = null;
        this.didChangeValue("isFault");
        this.didChangeValue("hasChanges");
    }    
        
    awakeFromInsert() {}
    awakeFromFetch() {}

    private _changedValues = {}; 
    get changedValues() {return this._changedValues;} 

    private _storedValues = null;
    private committedValues(){
        if (this.objectID.isTemporaryID == true) return {};
        // if (this.objectID.isTemporaryID == true && this._storedValues == null) {
        //     this._storedValues = {};
        //     return this._storedValues;
        // }

        if (this._storedValues == null) {
            // Get from the store
            if (this.objectID.persistentStore instanceof MIOIncrementalStore) {
                this._storedValues = this.storeValuesFromIncrementalStore(this.objectID.persistentStore);
            }
            else{
                throw new Error("MIOManagedObject: Only Incremental store is supported.");
            }
            this._setIsFault(false);
        }

        return this._storedValues;
    }

    private storeValuesFromIncrementalStore(store:MIOIncrementalStore){        
        let storedValues = {};        
        let properties = this.entity.properties;
        
        for(let index = 0; index < properties.length; index++){
            let property = properties[index];
            if (property instanceof MIOAttributeDescription) {
                let attribute = property as MIOAttributeDescription;
                let node = store.newValuesForObjectWithID(this.objectID, this.managedObjectContext);
                if (node == null) continue;
                let value = node.valueForPropertyDescription(attribute);                
                storedValues[attribute.name] = value;
            }
            else if (property instanceof MIORelationshipDescription) {
                let relationship = property as MIORelationshipDescription;                
                
                if (relationship.isToMany == false) {                    
                    let objectID = store.newValueForRelationship(relationship, this.objectID, this.managedObjectContext);
                    if (objectID != null){
                        storedValues[relationship.name] = objectID;
                    }                        
                }
                else {                  
                    // Tick. I store the value in a private property when the object is temporary                      
                    let set:MIOManagedObjectSet = MIOManagedObjectSet._setWithManagedObject(this, relationship);
                    //storedValues[relationship.name] = set;
                    
                    let objectIDs = store.newValueForRelationship(relationship, this.objectID, this.managedObjectContext);
                    if (objectIDs == null) continue;
                    
                    for(let count = 0; count < objectIDs.length; count++){
                        let objID = objectIDs[count];
                        set._addObjectID(objID);
                    }  
                    
                    this["_" + relationship.name] = set;                    
                }
            }
        }         
        
        return storedValues;
    }

    committedValuesForKeys(keys){
        let values = this.committedValues();
        if (keys == null) return values;

        let result = {};
        for (let key in keys){
            let obj = values[key];
            result[key] = obj;
        }

        return result;
    }

    willSave() {}
    didSave() {}

    willTurnIntoFault() {}
    didTurnIntoFault() {}

    willAccessValueForKey(key:string) {};
    didAccessValueForKey(key:string) {};

    // valueForKeyPath(keyPath:string) : any {

    //     let keys = keyPath.split(".");
        
    //     const k = keys[0];
    //     let value = this.valueForKey(k);
        
    //     // This means we are at the end of the key path tree
    //     if (keys.length == 1) return value;
        
    //     // We need to follow the tree
    //     const object = value as MIOManagedObject;
    //     keys.removeObjectAtIndex(0);
    //     const newKeyPath = keys.join(".")
    //     return object.valueForKeyPath(newKeyPath);
    // }

    valueForKey(key:string){
        if (key == null) return null;

        let property = this.entity.propertiesByName[key];
        if (property == null) {      
            return super.valueForKey(key);
        }      
        
        this.willAccessValueForKey(key);

        let value = null;

        if (property instanceof MIOAttributeDescription){
            if (key in this._changedValues) {
                value = this._changedValues[key];
            }
            else {
                value = this.primitiveValueForKey(key);
            }
        }
        else if (property instanceof MIORelationshipDescription){
            let relationship = property as MIORelationshipDescription;
            if (relationship.isToMany == false){
                if (key in this._changedValues) {
                    let objID:MIOManagedObjectID = this._changedValues[key];
                    if (objID != null) {
                        value = this.managedObjectContext.objectWithID(objID);
                    }
                }
                else {
                    value = this.primitiveValueForKey(key);
                }
            }
            else {                
                if (key in this._changedValues) {
                    value = this._changedValues[key];
                }
                else {
                    value = this.primitiveValueForKey(key);                    
                }
            }
        }   
  
        this.didAccessValueForKey(key);
        
        return value;
    }

    setValueForKey(value:any, key:string, visited:MIOSet = new MIOSet()){
        let property = this.entity.propertiesByName[key];

        if (property == null) {
            super.setValueForKey(value, key);
            return;
        }

        this.willChangeValueForKey(key);

        if (property instanceof MIORelationshipDescription){
            let relationship = property as MIORelationshipDescription;
                        
            if (relationship.isToMany == false){
                let currentValue = this.valueForKey(key);
                
                let objID = value != null ? (value as MIOManagedObject).objectID : null;
                this._changedValues[key] = objID;
            
                this._setInverseRelationshipValue(currentValue, value, relationship, visited);
            }
            else {
                // TODO: We don't support adding a set value yet.
            }            
        }
        else {
            this._changedValues[key] = value;
        }

        this.didChangeValueForKey(key);        

        this.managedObjectContext.updateObject(this);
    }

    primitiveValueForKey(key:string){
        
        let property = this.entity.propertiesByName[key];

        let committedValues = this.committedValues();
        
        if (property instanceof MIORelationshipDescription){
            let relationship = property as MIORelationshipDescription;
            if (relationship.isToMany == false){                
                let objID:MIOManagedObjectID = committedValues[key];
                if (objID == null) return null;
                let obj = this.managedObjectContext.objectWithID(objID);
                return obj;
            }
            else {                
                // Trick. I store the value in a private property when the object is temporary
                let set:MIOManagedObjectSet = this["_" + relationship.name];
                if (set == null) {
                    set = MIOManagedObjectSet._setWithManagedObject(this, relationship);
                    this["_" + relationship.name] = set;
                }
                return set;
            }
        }
        
        // Return attribute property
        return committedValues[key];
    }

    setPrimitiveValueForKey(value, key:string){
        
        let property = this.entity.propertiesByName[key];
        
        let committedValues = this.committedValues(); 

        if (value == null) {
            committedValues[key] = null;
        }
        else if (property instanceof MIORelationshipDescription){
            let relationship = property as MIORelationshipDescription;
            if (relationship.isToMany == false){
                let obj = value as MIOManagedObject;
                committedValues[key] = obj.objectID;
            }            
            else {
                if (value == null){
                    this["_" + relationship.name] = MIOManagedObjectSet._setWithManagedObject(this, relationship);
                }
                else {
                    if ((value instanceof MIOManagedObjectSet) == false) throw new Error("MIOManagedObject: Trying to set a value in relation ships that is not a set.");
                    this["_" + relationship.name] = value;
                }
            }
            
            let inverseRelationship = relationship.inverseRelationship;
            if (inverseRelationship != null) {
                // TODO:
            }
        }
        else {
            committedValues[key] = value;
        }

    }

    // hasFaultForRelationshipNamed(relationsipName:string){
    //     return this.relationshipNamesFaults.containsObject(relationsipName);
    // }

    //
    // PRIVATE 
    //


    _addObjectForKey(object:MIOManagedObject, key:string, visited:MIOSet = new MIOSet()){
        let set:MIOManagedObjectSet = this._changedValues[key];
        
        if (set == null) {
            // Check for committed value
            let storedSet = this.primitiveValueForKey(key);
            set = storedSet != null ? storedSet.copy() : null;
        }

        let rel:MIORelationshipDescription = this.entity.relationshipsByName[key];
        if (set == null) {            
            set = MIOManagedObjectSet._setWithManagedObject(this, rel);            
        }

        set.addObject(object);
        this._changedValues[key] = set;
        this.managedObjectContext.updateObject(this);

        this._setInverseRelationshipValue(null, object, rel, visited);
    }

    _removeObjectForKey(object, key:string, visited:MIOSet = new MIOSet()){
        let set:MIOManagedObjectSet = this._changedValues[key];
        
        if (set == null) {
            // Check for committed value
            let storedSet = this.primitiveValueForKey(key);
            set = storedSet != null ? storedSet.copy() : null;
        }

        let rel:MIORelationshipDescription = this.entity.relationshipsByName[key];
        if (set == null) {            
            set = MIOManagedObjectSet._setWithManagedObject(this, rel);
        }

        set.removeObject(object);
        this._changedValues[key] = set;
        this.managedObjectContext.updateObject(this);
        
        this._setInverseRelationshipValue(object, null, rel, visited);
    }
    
    _didCommit(){
        this._changedValues = {};
        this._storedValues = null;
        this._setIsFault(false);
    }

    private _setInverseRelationshipValue(oldValue:MIOManagedObject, newValue:MIOManagedObject, relationShip:MIORelationshipDescription, visited:MIOSet){
        if (relationShip.inverseRelationship == null) return;
        //if (oldValue == newValue) return;
        visited.addObject(this.objectID.URIRepresentation.absoluteString);
        
        let relName = relationShip.inverseName;        
        let relEntity = this.entity.managedObjectModel.entitiesByName[relationShip.inverseEntityName];
        let rel = relEntity.relationshipsByName[relName] as MIORelationshipDescription;
        if (rel.isToMany == false){
            if (oldValue != null && !visited.containsObject(oldValue.objectID.URIRepresentation.absoluteString)) oldValue.setValueForKey(null, relName, visited);
            // NOTE: This is to ensure, we update the graph correctly 
            if (oldValue != null && newValue != null && oldValue.objectID.URIRepresentation.absoluteString == newValue.objectID.URIRepresentation.absoluteString) {
                visited.removeObject(oldValue.objectID.URIRepresentation.absoluteString);
            }
            if (newValue != null && !visited.containsObject(newValue.objectID.URIRepresentation.absoluteString)) newValue.setValueForKey(this, relName, visited);
        }
        else {
            if (oldValue != null && !visited.containsObject(oldValue.objectID.URIRepresentation.absoluteString)) oldValue._removeObjectForKey(this, relName, visited);
            // NOTE: This is to ensure, we update the graph correctly
            if (oldValue != null && newValue != null && oldValue.objectID.URIRepresentation.absoluteString == newValue.objectID.URIRepresentation.absoluteString) {
                visited.removeObject(oldValue.objectID.URIRepresentation.absoluteString);
            }
            if (newValue != null && !visited.containsObject(newValue.objectID.URIRepresentation.absoluteString)) newValue._addObjectForKey(this, relName, visited);
        }
    }

    private insertToInverseRelationships(){

        let relationships = this.entity.relationshipsByName;
        for (let relName in relationships) {
            let rel:MIORelationshipDescription = relationships[relName];
            if (rel.inverseRelationship != null) {
                let parentObject:MIOManagedObject = this.valueForKey(relName);
                if (parentObject == null) continue;
                let parentRelationship = parentObject.entity.relationshipsByName[rel.inverseRelationship.name];
                if (parentRelationship.isToMany == false){
                    parentObject.setValueForKey(this, rel.inverseRelationship.name);
                }
                else {
                    let set:MIOManagedObjectSet = parentObject.valueForKey(rel.inverseRelationship.name);
                    set.addObject(this);
                }
            }
        }
    }

    private deleteInverseRelationships() {
        
        let relationships = this.entity.relationshipsByName;
        for (let relName in relationships) {
            let rel = relationships[relName] as MIORelationshipDescription;
            if (rel.inverseRelationship == null) continue;
            
            switch (rel.deleteRule) 
            {
                case MIODeleteRule.cascadeDeleteRule: this.deleteByCascade(rel); break;
                case MIODeleteRule.nullifyDeleteRule: this.deleteByNullify(rel); break;
                default: break
            }
        }
    }

    private deleteByNullify(relationship: MIORelationshipDescription){
        
        let visited = new MIOSet();
        visited.addObject(this);
        if (relationship.isToMany == false) {
            let obj = this.valueForKey(relationship.name) as MIOManagedObject;
            if (obj == null || obj.isDeleted == false) return;
            obj._nullify_inverse_relation(relationship.inverseRelationship, this, visited);
        }
        else {
            let objects = this.valueForKey(relationship.name) as MIOManagedObjectSet;
            for (let index = 0; index < objects.count; index++){
                let obj = objects.objectAtIndex(index);
                if (obj.isDeleted == false) obj._nullify_inverse_relation(relationship.inverseRelationship, this, visited);
            }
        }
    }
    
    private _nullify_inverse_relation (relationship: MIORelationshipDescription, obj: MIOManagedObject, visited: MIOSet) {
        if (relationship.isToMany == false) {            
            this.setValueForKey(null, relationship.name, visited);
        }
        else {
            this._removeObjectForKey(obj, relationship.name, visited);
        }
    }

    
    private deleteByCascade(relationship: MIORelationshipDescription) {

        if (relationship.isToMany == false) {
            let obj = this.valueForKey(relationship.name) as MIOManagedObject;
            if (obj == null || obj.isDeleted == false) return;
            this.managedObjectContext.deleteObject(obj);
        }
        else {
            let objects = this.valueForKey(relationship.name) as MIOManagedObjectSet;
            for (let index = 0; index < objects.count; index++){
                let obj = objects.objectAtIndex(index);
                if (obj.isDeleted == false) this.managedObjectContext.deleteObject(obj);
                this._removeObjectForKey(obj, relationship.name)
            }
        }
    }
    

    // private deleteFromInverseRelationships(){

    //     let relationships = this.entity.relationshipsByName;
    //     for (let relName in relationships) {
    //         let rel = relationships[relName] as MIORelationshipDescription;
    //         if (rel.inverseRelationship != null) {
    //             let value = this.valueForKey(relName);
    //             if (value == null) return;
    //             if (value instanceof MIOManagedObject) {
    //                 let object = value as MIOManagedObject;
    //                 let parentRelationship = object.entity.relationshipsByName[rel.inverseRelationship.name];
    //                 if (parentRelationship.isToMany == false){
    //                     object.setValueForKey(null, rel.inverseRelationship.name);
    //                 }
    //                 else {
    //                     object._removeObjectForKey(this, rel.inverseRelationship.name);
    //                 }
    //             }
    //             // else if (value instanceof MIOManagedObjectSet){
                    
    //             // }                
    //         }
    //     }
    // }
}
