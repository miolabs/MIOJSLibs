/**
 * Created by godshadow on 23/03/2017.
 */

/// <reference path="../MIOFoundation/MIOFoundation.ts" />

/// <reference path="MIOEntityDescription.ts" />
/// <reference path="MIOFetchRequest.ts" />

class MIOManagedObject extends MIOObject {
    
    objectID:string;
    entity:MIOEntityDescription = null;
    managedObjectContext:MIOManagedObjectContext = null;       

    private _trackChanges = {};  

    private _isFault = true;
    private setIsFault(value) {
        this.willChangeValue("isFault");
        this._isFault=value;
        this.didChangeValue("isFault");        
    }       
    set isFault(value:boolean) {this.setIsFault(value);}
    get isFault():boolean {return this._isFault;}
    
    private _isInserted = false;
    private _setIsInserted(value) {
        this.willChangeValue("isInserted");
        this.willChangeValue("hasChanges");
        this._isInserted=value;
        this.didChangeValue("isInserted");
        this.didChangeValue("hasChanges");
        this.isFault = true;
    }
    get isInserted():boolean {return this._isInserted;}
    
    private _isUpdated = false;
    private _setIsUpdated(value) {
        this.willChangeValue("isUpdated");
        this.willChangeValue("hasChanges");
        this._isUpdated=value;
        this.didChangeValue("isUpdated");
        this.didChangeValue("hasChanges");
        this.isFault = true;
    }
    get isUpdated():boolean {return this._isUpdated;}

    private _isDeleted = false;
    private _setIsDeleted(value) {
        this.willChangeValue("isDeleted");
        this.willChangeValue("hasChanges");
        this._isDeleted=value;
        this.didChangeValue("isDeleted");
        this.didChangeValue("hasChanges");
        this.isFault = true;
    };
    get isDeleted():boolean {return this._isDeleted;}

    initWithEntityAndInsertIntoManagedObjectContext(entityDescription:MIOEntityDescription, context?:MIOManagedObjectContext){

        super.init();

        this.entity = entityDescription;
        this.managedObjectContext = context;

        if (context != null) {
            this.managedObjectContext.insertObject(this);
            this._setIsInserted(true);
            this.awakeFromInsert();                    
        }
    }

    awakeFromInsert() {}
    awakeFromFetch() {}

    setValue(propertyName, value) {
        let rawName = "_" + propertyName;
        if (this[rawName] === value) {
            if (this._trackChanges[propertyName] != undefined)
                this.willChangeValue(propertyName);
                delete this._trackChanges[propertyName];
                this.didChangeValue(propertyName);
        }
        else {
            var oldValue = this.getValue(propertyName);
            if (oldValue != value) {

                this.willChangeValue(propertyName);
                this._trackChanges[propertyName] = value;
                this.didChangeValue(propertyName);

                if (this.managedObjectContext != null)
                    this.managedObjectContext.updateObject(this);
            }
        }        

        this._setIsUpdated(true);
    }

    getValue(propertyName) {
        var value = this._trackChanges[propertyName];
        if (value == null) {
            let rawName = "_" + propertyName;
            value = this[rawName];
        }

        return value;
    }    

    addObject(propertyName, object) {
        
        var array = this._trackChanges[propertyName];
        let rawName = "_" + propertyName;

        if (array == null) {

            var oldArray = this[rawName];
            if (oldArray != null)
                array = oldArray.slice(0);
            else
                array = [];
        }

        array.push(object);

        this._trackChanges[propertyName] = array;
        if (this.managedObjectContext != null)
            this.managedObjectContext.updateObject(this);

        this._setIsUpdated(true);
    }

    removeObject(propertyName, object) {
        var array = this._trackChanges[propertyName];
        if (array == null) {
            
            let rawName = "_" + propertyName;
            var oldArray = this[rawName];
            if (oldArray == null) return;

            // Clone the array to not touch the original ones
            array = oldArray.slice(0);        
        }

        var index = array.indexOf(object);        
        if (index == -1) return;

        // Remove the item in the array
        array.splice(index, 1);
            
        this._trackChanges[propertyName] = array;
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

    getChanges() {
        return this._trackChanges;
    }

    saveChanges() {
        for (var propertyName in this._trackChanges) {
            let rawName = "_" + propertyName;
            this[rawName] = this._trackChanges[propertyName];
        }
        this._trackChanges = {};

        this._setIsInserted(false);
        this._setIsUpdated(false);
        this._setIsDeleted(false);

        this.isFault = false;
    }

    discardChanges() {
        
        this._trackChanges = {};

        this._setIsInserted(false);
        this._setIsUpdated(false);
        this._setIsDeleted(false);        
    }    

    _markForDeletion() {
        this._setIsDeleted(true);
    }
}
