import { MIOObject, MIOSet } from "../MIOFoundation";
import { MIOManagedObjectID } from "./MIOManagedObjectID";
import { MIOManagedObjectContext } from "./MIOManagedObjectContext";
import { MIOEntityDescription } from "./MIOEntityDescription";
import { MIOIncrementalStore } from "./MIOIncrementalStore";
import { MIOAttributeDescription } from "./MIOAttributeDescription";
import { MIODeleteRule, MIORelationshipDescription } from "./MIORelationshipDescription";
import { MIOManagedObjectSet } from "./MIOManagedObjectSet";
import { MIOManagedObjectModel } from "./MIOManagedObjectModel";
import { MIOPersistentStore } from "./MIOPersistentStore";

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
    
    private _objectID:MIOManagedObjectID|null = null;    
    get objectID():MIOManagedObjectID {return this._objectID!;}
    get entity():MIOEntityDescription {return this.objectID.entity;}

    private _managedObjectContext:MIOManagedObjectContext|null = null;
    get managedObjectContext():MIOManagedObjectContext {return this._managedObjectContext!;}

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
        if (value == true) {
            this._storedValues = {};
            this.relationShipsNamedNotFault = new MIOSet();
        }
        this.didChangeValue("isFault");
        this.didChangeValue("hasChanges");
    }
        
    awakeFromInsert() {}
    awakeFromFetch() {}

    private _changedValues = {}; 
    get changedValues() {return this._changedValues;} 

    private _storedValues = {};
    get storedValues() {
        if (this.objectID.isTemporaryID == true) { return {}; }
        if (this.objectID.persistentStore == null) { return {}; }
        
        if (this._isFault == false) { return this._storedValues; }
        
        this.unfaultAttributesFromStore( this.objectID.persistentStore! );
        return this._storedValues;
    }

    private unfaultAttributesFromStore(store:MIOPersistentStore){
        if (this.objectID.isTemporaryID == true) { return; }

        if (store instanceof MIOIncrementalStore) { 
            let node = store.newValuesForObjectWithID( this.objectID, this.managedObjectContext );
            if (node == null) { return }
            
            for ( let attr of this.entity.attributes ) {
                let value = node.valueForPropertyDescription(attr);
                this._storedValues[attr.name] = value;
            }
        }
        else {
            throw new Error("MIOManagedObject: Only Incremental store is supported.");
        }
        this._setIsFault(false);
    }

    private relationShipsNamedNotFault = new MIOSet();
    hasFaultForRelationshipNamed( key: String ) : Boolean { 
        return !this.relationShipsNamedNotFault.containsObject(key);
    }
    faultRelationships() { this.relationShipsNamedNotFault = new MIOSet(); }

    private unfaultRelationshipNamed( key:string, store:MIOPersistentStore|null) {
        if (store == null) { return null; }
        if (this.objectID.isTemporaryID == true) { return null; }

        let relation = this.entity.relationshipsByName[key];
        if (relation == null) { return }        

        if (this.isFault) { this.unfaultAttributesFromStore( store! ) }
        
        if (store instanceof MIOIncrementalStore == false) { return } 

        this.relationShipsNamedNotFault.addObject(key);        
        if (relation.isToMany == false) {                    
            let objectID = ( store as MIOIncrementalStore).newValueForRelationship(relation, this.objectID, this.managedObjectContext);
            if (objectID != null){
                this._storedValues[relation.name] = objectID;
            }                        
        }
        else {                  
            let set:MIOManagedObjectSet = MIOManagedObjectSet._setWithManagedObject(this, relation);            
            let objectIDs = ( store as MIOIncrementalStore ).newValueForRelationship(relation, this.objectID, this.managedObjectContext);
            
            for(let count = 0; count < objectIDs?.length; count++){
                let objID = objectIDs[count];
                set._addObjectID(objID);
            }              
            this._storedValues[relation.name] = set;
        }
    }

    committedValuesForKeys(keys:string[]|null) : any {
        if (keys == null) { return this.storedValues }
        
        let values = {};
        for (let k of keys) {
            let p = this.entity.propertiesByName[k];
            if (p instanceof MIORelationshipDescription && this.hasFaultForRelationshipNamed(k)) {
                this.unfaultRelationshipNamed(k, this.objectID.persistentStore);                
            }            
            values[ k ] = this.storedValues[ k ];            
        }

        return values;
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


/*        let property = this.entity.propertiesByName[key];
        if (property == null) {      
            return super.valueForKey(key);
        }      

        
        

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
    }*/

    valueForKey(key:string){
        if (key == null) return null;
        this.willAccessValueForKey(key);
        let v = this.primitiveValueForKey(key);
        this.didAccessValueForKey(key);
        return v;
    }

    primitiveValueForKey(key:string){
        if (key == null) return null;

        let property = this.entity.propertiesByName[key];
        if (property == null) { return super.valueForKey(key); }

        
        if (property instanceof MIOAttributeDescription) {
            return ( key in this._changedValues ) ? this._changedValues[key] : this.storedValues[key];
        }
        else if (property instanceof MIORelationshipDescription){
            let relationship = property as MIORelationshipDescription;
            let v = ( key in this._changedValues ) ? this._changedValues[key] : this.committedValuesForKeys([key])[ key ];
            if ( relationship.isToMany == false )return  v != null ? this.managedObjectContext.objectWithID(v) : null;
            else return v;
        }  
    }

    setValueForKey(value:any, key:string, visited:MIOSet = new MIOSet()) {
        this.willChangeValueForKey(key);
        this.setPrimitiveValueForKey(value, key, visited);
        this.didChangeValueForKey(key);        
    }

    setPrimitiveValueForKey(value:any, key:string, visited:MIOSet = new MIOSet()){
        let property = this.entity.propertiesByName[key];

        if (property == null) {
            super.setValueForKey(value, key);
            return;
        }

        if (property instanceof MIOAttributeDescription){
            this._changedValues[key] = value;
        }
        else if (property instanceof MIORelationshipDescription){
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

        this.managedObjectContext.updateObject(this);
    }

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
        this._setIsFault(true);
    }

    private _setInverseRelationshipValue(oldValue:MIOManagedObject|null, newValue:MIOManagedObject|null, relationShip:MIORelationshipDescription, visited:MIOSet){
        if (relationShip.inverseRelationship == null) return;
        //if (oldValue == newValue) return;
        if (visited.containsObject(this.objectID.URIRepresentation.absoluteString)) return;
        visited.addObject(this.objectID.URIRepresentation.absoluteString);
        
        let relName = relationShip.inverseName;    
        if (relName == null) return;
        if (relationShip.inverseEntityName == null) return;

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
            if (obj == null || obj.isDeleted == true) return;
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
    
    private _nullify_inverse_relation (relationship: MIORelationshipDescription|null, obj: MIOManagedObject, visited: MIOSet) {
        if (relationship == null) return;
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
