

/// <reference path="../MIOFoundation/MIOFoundation.ts" />


class MIOManagedObjectSet extends MIOObject {

    static _setWithManagedObject(object:MIOManagedObject, relationship:MIORelationshipDescription) {
        let mos = new MIOManagedObjectSet();
        mos._initWithManagedObject(object, relationship);
        return mos;
    }

    private mo:MIOManagedObject = null;
    private relationship:MIORelationshipDescription = null;
    private objectIDs = [];
    private relationshipFault = true;

    init(){
        throw("MIOManagedObjectSet: Can't initialize an MIOManagedObjectSet with -init")
    }

    _initWithManagedObject(object:MIOManagedObject, relationship:MIORelationshipDescription){
        super.init();
        this.mo = object;
        this.relationship = relationship;
    }

    _addObjectID(objectID:MIOManagedObjectID){
        if (this.objectIDs.containsObject(objectID) == true) return;
        this.objectIDs.addObject(objectID);
    }

    addObject(object:MIOManagedObject){
        this._addObjectID(object.objectID);
    }

    _removeObject(objectID:MIOManagedObjectID){
        if (this.objectIDs.containsObject(objectID) == true) return;
        this.objectIDs.removeObject(objectID);
    }

    removeObject(object:MIOManagedObject){
        this._removeObject(object.objectID);
    }

    removeAllObjects(){        
        this.objectIDs = [];
    }

    indexOfObject(object:MIOManagedObject) {
        return this.objectIDs.indexOfObject(object.objectID);
    }

    containsObject(object:MIOManagedObject){
        return this.objectIDs.indexOfObject(object.objectID) > -1 ? true : false;
    }

    objectAtIndex(index){
        var objects = this.allObjects;
        return objects.objectAtIndex(index);
    }

    private objects = null;
    get allObjects(){
        if (this.relationshipFault == false){
            return this.objects;
        }

        this.objects = [];
        this.relationshipFault = false;

        for(let index = 0; index < this.objectIDs.length; index++){
            let objID = this.objectIDs[index];
            let obj = this.mo.managedObjectContext.objectWithID(objID);
            this.objects.addObject(obj);
        }                                            

        return this.objects;
    }

    get count(){
        return this.objectIDs.length;
    }

    get length(){
        return this.count;
    }    

    filterWithPredicate(predicate:MIOPredicate) {
        var objs = _MIOPredicateFilterObjects(this.allObjects, predicate);
        return objs;
    }
    
    // Prevent KVO on special properties
    addObserver(obs, keypath:string, context?){
        if (keypath == "count" || keypath == "length") throw "MIOSet: Can't observe count. It's not KVO Compilant"; 
        super.addObserver(obs, keypath, context);
    }

    _reset(){
        this.relationshipFault = true;
        this.objects = [];
        this.objectIDs = [];
    }
}
