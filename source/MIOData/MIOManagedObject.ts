/**
 * Created by godshadow on 23/03/2017.
 */

/// <reference path="../MIOFoundation/MIOFoundation.ts" />

/// <reference path="MIOEntityDescription.ts" />
/// <reference path="MIOFetchRequest.ts" />

/// <reference path="MIOManagedObjectID.ts" />
/// <reference path="MIOManagedObjectSet.ts" />


class MIOManagedObject extends MIOObject {        

    init(){
        throw("MIOManagedObject: Can't initialize an MIOManagedObject with -init");
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
        for(var key in attributes) {
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

    _version = -1;

    private _changedValues = {}; 
    get changedValues() {return this._changedValues;} 

    private _storedValues = null;
    private committedValues(){
        if (this.objectID.isTemporaryID == true) return {};

        if (this._storedValues == null) {
            // Get from the store
            if (this.objectID.persistentStore instanceof MIOIncrementalStore) {
                this._storedValues = this.storeValuesFromIncrementalStore(this.objectID.persistentStore);
            }
            else{
                throw("MIOManagedObject: Only Incremental store is supported.");
            }
            this._setIsFault(false);
        }

        return this._storedValues;
    }

    private storeValuesFromIncrementalStore(store:MIOIncrementalStore){        
        var storedValues = {};        
        let properties = this.entity.properties;
        
        for(let index = 0; index < properties.length; index++){
            let property = properties[index];
            if (property instanceof MIOAttributeDescription) {
                let attribute = property as MIOAttributeDescription;
                let node = store.newValuesForObjectWithID(this.objectID, this.managedObjectContext);
                let value = node.valueForPropertyDescription(attribute);                
                storedValues[attribute.name] = value;
            }
            else if (property instanceof MIORelationshipDescription) {
                let relationship = property as MIORelationshipDescription;                
                
                if (relationship.isToMany == false) {                    
                    var objectID = store.newValueForRelationship(relationship, this.objectID, this.managedObjectContext);
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
                    
                    for(let index = 0; index < objectIDs.length; index++){
                        let objID = objectIDs[index];
                        set._addObjectID(objID);
                    }                                            
                }
            }
        } 

        let node = store._nodeForObjectID(this.objectID, this.managedObjectContext);
        this._version = node.version;
        
        return storedValues;
    }

    committedValuesForKeys(keys){
        let values = this.committedValues();
        if (keys == null) return values;

        var result = {};
        for (var key in keys){
            let obj = values[key];
            if (obj != null) result[key] = obj;
        }

        return result;
    }

    willSave() {}
    didSave() {}

    willTurnIntoFault() {}
    didTurnIntoFault() {}

    willAccessValueForKey(key:string) {};
    didAccessValueForKey(key:string) {};

    valueForKey(key:string){
        if (key == null) return null;

        let property = this.entity.propertiesByName[key];
        if (property == null) {      
            return super.valueForKey(key);
        }      
        
        this.willAccessValueForKey(key);

        var value = null;

        if (property instanceof MIOAttributeDescription){
            value = this._changedValues[key];
            if (value == null) {
                value = this.primitiveValueForKey(key);
            }
        }
        else if (property instanceof MIORelationshipDescription){
            let relationship = property as MIORelationshipDescription;
            if (relationship.isToMany == false){
                let objID:MIOManagedObjectID = this._changedValues[key];
                if (objID != null) {
                    value = this.managedObjectContext.objectWithID(objID);
                }
                else {
                    value = this.primitiveValueForKey(key);
                }
            }
            else {                
                // Tick. I store the value in a private property when the object is temporary
                value = this._changedValues[key];
                if (value == null){
                    value = this.primitiveValueForKey(key);                    
                }
            }
        }   
  
        this.didAccessValueForKey(key);
        
        return value;
    }

    setValueForKey(value, key:string){
        let property = this.entity.propertiesByName[key];

        if (property == null) {
            super.setValueForKey(value, key);
            return;
        }

        this.willChangeValueForKey(key);

        if (value == null) {
            this._changedValues[key] = null;
        }
        else if (property instanceof MIORelationshipDescription){
            let relationship = property as MIORelationshipDescription;
            if (relationship.isToMany == false){
                let obj = value as MIOManagedObject;
                this._changedValues[key] = obj.objectID;
            }            
            
            let inverseRelationship = relationship.inverseRelationship;
            if (inverseRelationship != null) {
                // TODO:
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
                // Tick. I store the value in a private property when the object is temporary
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
                    if ((value instanceof MIOManagedObjectSet) == false) throw("MIOManagedObject: Trying to set a value in relation ships that is not a set.");
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


    _addObjectForKey(object, key:string){        
        let set:MIOManagedObjectSet = this.valueForKey(key);
        if (set == null) {
            let rel:MIORelationshipDescription = this.entity.relationshipsByName[key];            
            set = MIOManagedObjectSet._setWithManagedObject(this, rel);
        }        
        set.addObject(object);
        this._changedValues[key] = set;
        this.managedObjectContext.updateObject(this);
    }

    _removeObjectForKey(object, key:string){        
        let set:MIOManagedObjectSet = this.valueForKey(key);
        if (set == null) {
            let rel:MIORelationshipDescription = this.entity.relationshipsByName[key];                    
            set = MIOManagedObjectSet._setWithManagedObject(this, rel);
        }
        else {
            set.removeObject(object);
        }
        this._changedValues[key] = set;
        this.managedObjectContext.updateObject(this);
    }
    
    _didCommit(){
        this._changedValues = {};
        this._storedValues = null;
        this._setIsFault(false);
    }

}
