/**
 * Created by godshadow on 23/03/2017.
 */

/// <reference path="../MIOFoundation/MIOFoundation.ts" />

/// <reference path="MIOEntityDescription.ts" />
/// <reference path="MIOFetchRequest.ts" />

/// <reference path="MIOManagedObjectID.ts" />

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
    }

    initWithEntityAndInsertIntoManagedObjectContext(entity:MIOEntityDescription, context:MIOManagedObjectContext){        
        
        let objectID = MIOManagedObjectID._objectIDWithEntity(entity);
        this._initWithObjectID(objectID, context);
        
        // Set default values
        let attributes = entity.attributesByName;
        for(var key in attributes) {
            let attr = attributes[key];
            let value = attr.defaultValue;

            if (value == null) continue;

            this.setPrimitiveValueForKey(value, key);
        }

        context.insertObject(this);
    }
    
    private _objectID:MIOManagedObjectID = null;    
    get objectID():MIOManagedObjectID {return this._objectID;}
    get entity():MIOEntityDescription {return this.objectID.entity;}

    private _managedObjectContext:MIOManagedObjectContext = null;
    get managedObjectContext():MIOManagedObjectContext {return this._managedObjectContext;}

    get hasChanges():boolean {return (this._isInserted || this._isUpdated || this._isDeleted);}

    private _isInserted = false;
    get isInserted():boolean {return this._isInserted;}
    _setIsInserted(value) {
        this.willChangeValue("hasChanges");
        this.willChangeValue("isInserted");
        this._isInserted = value;
        this.didChangeValue("isInserted");
        this.didChangeValue("hasChanges");
    }    

    private _isUpdated = false;
    get isUpdated():boolean {return this._isUpdated;}
    _setIsUpdated(value) {
        this.willChangeValue("hasChanges");
        this.willChangeValue("isUpdated");
        this._isUpdated = value;
        this.didChangeValue("isUpdated");
        this.didChangeValue("hasChanges");
    }
    
    private _isDeleted = false;
    get isDeleted():boolean {return this._isDeleted;}
    _setIsDeleted(value) {
        this.willChangeValue("hasChanges");
        this.willChangeValue("isDeleted");
        this._isDeleted = value;
        this.didChangeValue("isDeleted");
        this.didChangeValue("hasChanges");
    }
    
    private _isFault = false;
    get isFault():boolean {return this._isFault;}
    _setIsFault(value) {
        if (value == this._isFault) return;
        this.willChangeValue("hasChanges");
        this.willChangeValue("isFault");
        this._isFault = value;
        if (value == "false") this._storedValues = null;
        this.didChangeValue("isFault");
        this.didChangeValue("hasChanges");
    }    
        
    awakeFromInsert() {}
    awakeFromFetch() {}

    _version = 0;

    private _changedValues = {}; 
    get changedValues() {return this._changedValues;} 

    private _storedValues = null;
    private _getCommittedValues(){
        if (this.objectID.isTemporaryID == true) return {};

        if (this._storedValues == null) {
            // Get from the store
            if (this.objectID.persistentStore instanceof MIOIncrementalStore) {
                this._storedValues = this._getCommittedValuesFromIncrementalStore(this.objectID.persistentStore);
            }
            else{
                throw("MIOManagedObject: Only Incremental store is supported.");
            }
            this._setIsFault(false);
        }

        return this._storedValues;
    }

    private _getCommittedValuesFromIncrementalStore(store:MIOIncrementalStore){
        
        var storedValues = {};
        
        // let node:MIOIncrementalStoreNode = store._nodeForObjectID(this._objectID, this.managedObjectContext);
        // if (node == null){
        //     throw("MIOManagedObject: node store is null");
        // }

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
                    var value = store.newValueForRelationship(relationship, this.objectID, this.managedObjectContext);
                    if (value != null) storedValues[relationship.name] = value;
                }
                else {
                    var set = MIOSet.set();
                    let values = [];//store.newValueForRelationship(relationship, this.objectID, this.managedObjectContext);                    
                    for (let index2 = 0; index2 < values.length; index2++){
                        let objID = values[index2];
                        set.addObject(objID);
                    }                    
                    storedValues[relationship.name] = set;
                }
            }
        } 
        
        return storedValues;
    }

    committedValuesForKeys(keys){

        let values = this._getCommittedValues();
        
        if (keys == null) return values;

        if (values == null) return null;

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

        let propertyName = property.name;

        if (property instanceof MIOAttributeDescription){
            this.willAccessValueForKey(propertyName);
            var value = this.primitiveValueForKey(propertyName);
            this.didAccessValueForKey(propertyName);            
            return value;
        }
        else if (property instanceof MIORelationshipDescription) {
            let relationship = property as MIORelationshipDescription;

            this.willAccessValueForKey(propertyName);
            
            var value = null;

            if (relationship.isToMany == false){
                let objectID = this.primitiveValueForKey(propertyName);
                if (objectID != null){                    
                    value = this.managedObjectContext.objectWithID(objectID);
                }
            } else {
                // Trick. Storing set in private property                
                value = this["_" + propertyName];
                value.removeAllObjects();                
                let objectIDs = this.primitiveValueForKey(propertyName);
                for(let index = 0; index < objectIDs.length; index++){
                    let objID = objectIDs[index];
                    let obj = this._managedObjectContext.objectWithID(objID);
                    value.addObject(obj);
                }
            }

            this.didAccessValueForKey(propertyName);
            return value;
        }

        return super.valueForKey(key);
    }

    setValueForKey(value, key:string){

        let property = this.entity.propertiesByName[key];

        if (property == null) {
            super.setValueForKey(value, key);
            return;
        }

        let propertyName = property.name;

        if (property instanceof MIOAttributeDescription){
            this.willChangeValueForKey(propertyName);
            this.setPrimitiveValueForKey(value, propertyName);
            this.didChangeValueForKey(propertyName);
            return;
        }
        else if (property instanceof MIORelationshipDescription){
            let relationship = property as MIORelationshipDescription;
            let inverseRelationship = relationship.inverseRelationship;
            var valueByID = null;

            if (relationship.isToMany == false){
                valueByID = value.objectID;
            }
            else {
                var set = MIOSet.set();
                for (var index = 0; index < value.length; index++){
                    let obj = value[index];
                    set.addObject(obj.objectID);
                }
                valueByID = set;
            }

            if (inverseRelationship != null) {
                // TODO:
            }

            this.willChangeValueForKey(propertyName);
            this.setPrimitiveValueForKey(valueByID, propertyName);
            this.didChangeValueForKey(propertyName);

        }

        super.setValueForKey(value, key);
    }

    primitiveValueForKey(key:string){
        var value = this._changedValues[key];
        if (value == null) {
            let committedValues = this._getCommittedValues();
            value = committedValues[key];
        }
        return value;
    }

    setPrimitiveValueForKey(value, key:string){
        if (value == null) {
            delete this._changedValues[key];
        }
        else {
            this._changedValues[key] = value;
        }
    }

    _didCommit(){
        this._changedValues = {};
        this._storedValues = null;
        this._setIsFault(false);
    }

    /*

    _version = 0;
    private mergeFromStore(){
        
        let ps = this.objectID.persistentStore as MIOIncrementalStore;
        if (ps == null) return;
        ps.updateObjectWithObjectID(this.objectID, this.managedObjectContext);
        //this.isFault = false;
    }

    setValue(propertyName, value) {
        
        let initValue = this.primitiveValue(propertyName);
        let trackValue = this._changedValues[propertyName];       
        
        if (trackValue !== value) {
            this.willChangeValue(propertyName);
            if (initValue !== value)
                if (value != null)
                    this.trackChanges[propertyName] = value;
                else 
                    this.trackChanges[propertyName] = MIONull.nullValue();
            else 
                delete this.trackChanges[propertyName];
            this.didChangeValue(propertyName);
        }        
                
        if (this.managedObjectContext != null) {
            this.managedObjectContext.updateObject(this);            
        }        

        this._setIsUpdated(true);
    }

    getValue(propertyName) {
        
        if (this.isFault == true) {
            this.mergeFromStore();
        }

        var value = this.trackChanges[propertyName];
        if (value == null) {
            value = this.primitiveValue(propertyName);
        }else if (value instanceof MIONull) {
            return null;
        }

        return value;
    }    
    
    setPrimitiveValue(value, propertyName) {
        let rawName = "_" + propertyName;
        this[rawName] = value;
    }

    primitiveValue(propertyName) {
        let rawName = "_" + propertyName;
        let value = this[rawName];
        
        return value;
    }

    addObject(propertyName, object) {

        let rawName = "_" + propertyName;
        var array = this[rawName];

        var newArray:MIOSet = this.trackChanges[propertyName];
        if (newArray == null) {            
            newArray = array.copy();
            this.trackChanges[propertyName] = newArray;
        }
        
        newArray.addObject(object);
        
        if (this.managedObjectContext != null)
            this.managedObjectContext.updateObject(this);

        this._setIsUpdated(true);
    }

    removeObject(propertyName, object) {
        
        let rawName = "_" + propertyName;
        var array = this[rawName];

        var newArray:MIOSet = this.trackChanges[propertyName];        
        if (newArray == null) {            
            newArray = array.copy();
            this.trackChanges[propertyName] = newArray;
        }

        newArray.removeObject(object);
        
        if (this.managedObjectContext != null)
            this.managedObjectContext.updateObject(this);

        this._setIsUpdated(true);
    }

    addObjects(propertyName, objects){

        objects.forEach(element => {
            this.addObject(propertyName, element);
        });
    }

    removeObjects(propertyName, objects){
        
        objects.forEach(element => {
            this.removeObject(propertyName, element);
        });        
    }

    get hasChanges() {
        return (this.isInserted || this.isUpdated || this.isDeleted);
    }

    //TODO: Remoe this method -> Not cocoa compatible
    getChanges() {
        return this.trackChanges;
    }

    changedValues(){
        
        var values = {};
        for (var propertyName in this.trackChanges){
            values[propertyName] = this.trackChanges[propertyName];      
        }

        return values;
    }

    saveChanges() {

        for (var propertyName in this.trackChanges) {
            let rawName = "_" + propertyName;
            let value = this.trackChanges[propertyName];
            if (value instanceof MIONull) {
                this[rawName] = null;
            }
            else if (value instanceof MIOSet) {
                let newArray:MIOSet = value;
                let oldArray:MIOSet = this[rawName];
                oldArray.removeAllObjects();
                for (var index = 0; index < newArray.length; index++){
                    let o = newArray.objectAtIndex(index);
                    oldArray.addObject(o);
                }
            }
            else {
                this[rawName] = value;
            }
        }

        this.trackChanges = {};
        
        this._setIsInserted(false);
        this._setIsUpdated(false);
        this._setIsDeleted(false);

        this.isFault = false;
    }

    discardChanges() {     
        
        this.trackChanges = {};
        
        this._setIsInserted(false);
        this._setIsUpdated(false);
        this._setIsDeleted(false);        
    }    

    _markForDeletion() {
        this._setIsDeleted(true);
    }
*/

}
