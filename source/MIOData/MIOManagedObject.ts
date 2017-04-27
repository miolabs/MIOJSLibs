/**
 * Created by godshadow on 23/03/2017.
 */

/// <reference path="../MIOFoundation/MIOFoundation.ts" />

class MIOFetchRequest extends MIOObject {
    entityName = null;
    predicate = null;
    sortDescriptors = null;

    static fetchRequestWithEntityName(name) {
        var fetch = new MIOFetchRequest();
        fetch.initWithEntityName(name);

        return fetch;
    }

    initWithEntityName(name) {
        this.entityName = name;
    }
}

class MIOEntityDescription extends MIOObject {
    private entityName = null;

    public static insertNewObjectForEntityForName(entityName, context) {
        var object = context.insertNewObjectForEntityName(entityName);

        return object;
    }
}

class MIOManagedObject extends MIOObject {
    entityName = null;
    managedObjectContext = null;

    private _trackChanges = {};

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
    }

    get hasChanges() {
        return (Object.keys(this._trackChanges).length > 0);
    }

    getChanges() {
        return this._trackChanges;
    }

    saveChanges() {
        for (var propertyName in this._trackChanges) {
            this[propertyName] = this._trackChanges[propertyName];
        }
        this._trackChanges = {};
    }

    discardChanges() {
        this._trackChanges = {};
    }
}
