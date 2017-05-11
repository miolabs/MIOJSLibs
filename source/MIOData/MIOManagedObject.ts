/**
 * Created by godshadow on 23/03/2017.
 */

/// <reference path="../MIOFoundation/MIOFoundation.ts" />

/// <reference path="MIOEntityDescription.ts" />
/// <reference path="MIOFetchRequest.ts" />

class MIOManagedObject extends MIOObject {
    
    entity:MIOEntityDescription = null;
    managedObjectContext = null;

    private _trackChanges = {};

    private _isInserted = false;
    private _setIsInserted(value) {this.willChangeValue("isInserted");this._isInserted=value;this.didChangeValue("isInserted")};
    get isInserted():boolean {return this._isInserted};
    
    private _isUpdated = false;
    private _setIsUpdated(value) {
        if (this.isInserted) return;
        this.willChangeValue("_isUpdated");
        this._isUpdated=value;
        this.didChangeValue("_isUpdated")};
    get isUpdated():boolean {return this._isUpdated};

    private _isDeleted = false;
    private _setIsDeleted(value) {this.willChangeValue("_isDeleted");this._isDeleted=value;this.didChangeValue("_isDeleted")};
    get isDeleted():boolean {return this._isDeleted};

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
        if (this[propertyName] === value) {
            if (this._trackChanges[propertyName] != undefined)
                delete this._trackChanges[propertyName];
        }
        else {
            var oldValue = this.getValue(propertyName);
            if (oldValue != value) {

                this._trackChanges[propertyName] = value;
                if (this.managedObjectContext != null)
                    this.managedObjectContext.updateObject(this);
            }
        }

        this._setIsUpdated(true);
    }

    getValue(propertyName) {
        var value = this._trackChanges[propertyName];
        if (value == null)
            value = this[propertyName];

        return value;
    }    

    addObject(propertyName, object) {
        var array = this._trackChanges[propertyName];

        if (array == null) {

            var oldArray = this[propertyName];
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
            var oldArray = this[propertyName];
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

    get hasChanges() {
        return (this.isInserted || this.isUpdated || this.isDeleted);
    }

    getChanges() {
        return this._trackChanges;
    }

    saveChanges() {
        for (var propertyName in this._trackChanges) {
            this[propertyName] = this._trackChanges[propertyName];
        }
        this._trackChanges = {};

        this._setIsInserted(false);
        this._setIsUpdated(false);
        this._setIsDeleted(false);
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
