/**
 * Created by godshadow on 23/03/2017.
 */

/// <reference path="../MIOFoundation/MIOFoundation.ts" />

/// <reference path="MIOEntityDescription.ts" />
/// <reference path="MIOFetchRequest.ts" />

/// <reference path="MIOManagedObjectID.ts" />

class MIOManagedObject extends MIOObject {
    
    objectID:MIOManagedObjectID = null;
    entity:MIOEntityDescription = null;
    managedObjectContext:MIOManagedObjectContext = null;       

    private trackChanges = {};  

    private _isFault = false;
    private setIsFault(value) {
        this.willChangeValue("isFault");
        this._isFault = value;
        this.didChangeValue("isFault");        
    }       
    set isFault(value:boolean) {this.setIsFault(value);}
    get isFault():boolean {return this._isFault;}
    
    private _isInserted = false;
    private _setIsInserted(value) {
        this.willChangeValue("isInserted");
        this.willChangeValue("hasChanges");
        this._isInserted = value;
        this.didChangeValue("isInserted");
        this.didChangeValue("hasChanges");
        this.isFault = true;
    }
    get isInserted():boolean {return this._isInserted;}
    
    private _isUpdated = false;
    private _setIsUpdated(value) {
        this.willChangeValue("isUpdated");
        this.willChangeValue("hasChanges");
        this._isUpdated = value;
        this.didChangeValue("isUpdated");
        this.didChangeValue("hasChanges");
        this.isFault = true;
    }
    get isUpdated():boolean {return this._isUpdated;}

    private _isDeleted = false;
    private _setIsDeleted(value) {
        this.willChangeValue("isDeleted");
        this.willChangeValue("hasChanges");
        this._isDeleted = value;
        this.didChangeValue("isDeleted");
        this.didChangeValue("hasChanges");
        this.isFault = true;
    };
    get isDeleted():boolean {return this._isDeleted;}

    initWithEntityAndInsertIntoManagedObjectContext(entityDescription:MIOEntityDescription, context?:MIOManagedObjectContext){        
        
        this.init();

        if (this.objectID == null) this.objectID = MIOManagedObjectID.objectIDWithEntity(entityDescription);
        this.entity = entityDescription;
        this.managedObjectContext = context;

        if (context != null) {
            this.managedObjectContext.insertObject(this);
            this._setIsInserted(true);
            this.awakeFromInsert();                    
        }

        // Set default value
        for(var index = 0; index < entityDescription.attributes.length; index++) {
            
            let attr:MIOAttributeDescription = entityDescription.attributes[index];
            let dv = attr.defaultValue;

            if (dv == null) continue;
            
            this.setPrimitiveValue(attr.name, dv);
        }
    }

    init(){
        super.init();        
    }

    awakeFromInsert() {}
    awakeFromFetch() {}

    private version = 0;
    private mergeFromStore(){
        
        let ps = this.objectID.persistentStore as MIOIncrementalStore;
        if (ps == null) return;
        this.version = ps.updateObjectWithObjectID(this.objectID, this.managedObjectContext);
        this.isFault = false;
    }

    setValue(propertyName, value) {
        
        let initValue = this.primitiveValue(propertyName);
        let trackValue = this.trackChanges[propertyName];       
        
        if (trackValue !== value) {
            this.willChangeValue(propertyName);
            if (initValue !== value)
                this.trackChanges[propertyName] = value;
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
        }

        return value;
    }    
    
    setPrimitiveValue(propertyName, value) {
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
            values[propertyName] = this.primitiveValue(propertyName);      
        }

        return values;
    }

    saveChanges() {

        for (var propertyName in this.trackChanges) {
            let rawName = "_" + propertyName;
            let value = this.trackChanges[propertyName];
            if (value instanceof MIOSet) {
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
}
