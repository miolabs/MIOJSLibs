import { MIOObject, MIOPredicate, _MIOPredicateFilterObjects, _MIOSortDescriptorSortObjects} from "../MIOFoundation";
import { MIORelationshipDescription } from "./MIORelationshipDescription";
import { MIOManagedObjectID } from "./MIOManagedObjectID";
import { MIOManagedObject } from "./MIOManagedObject";
import { MIOSortDescriptor } from "../MIOFoundation";

export class MIOManagedObjectSet<T = any> extends MIOObject {

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
        throw new Error("MIOManagedObjectSet: Can't initialize an MIOManagedObjectSet with -init")
    }

    _initWithManagedObject(object:MIOManagedObject, relationship:MIORelationshipDescription){
        super.init();
        this.mo = object;
        this.relationship = relationship;
    }

    _addObjectID(objectID:MIOManagedObjectID){
        if (this.objectIDs.containsObject(objectID) == true) return;
        this.objectIDs.addObject(objectID);
        this.relationshipFault = true;        
    }

    addObject(object:MIOManagedObject){
        this._addObjectID(object.objectID);
    }

    _removeObject(objectID:MIOManagedObjectID){
        if (this.objectIDs.containsObject(objectID) == false) return;
        this.objectIDs.removeObject(objectID);
        this.relationshipFault = true;        
    }

    removeObject(object:MIOManagedObject){
        this._removeObject(object.objectID);
    }

    removeAllObjects(){        
        this.objectIDs = [];
    }

    indexOfObject(object:MIOManagedObject|string|Array<string>) {
        if (object instanceof MIOManagedObject) return this.objectIDs.indexOfObject(object.objectID);
        let ids = this.allObjects.map( function(e){ return e.objectID._getReferenceObject(); } );
        
        if ( typeof( object ) === "string" ){
            return ids.indexOfObject( object );
        }

        for (let id of ids) {
            if ( object.containsObject(id) ) return 0;
        }
        return -1;
    }

    containsObject(object:MIOManagedObject){
        return this.objectIDs.indexOfObject(object.objectID) > -1 ? true : false;
    }

    objectAtIndex(index){
        let objects = this.allObjects;
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
        let objs = _MIOPredicateFilterObjects(this.allObjects, predicate);
        return objs;
    }

    sortedArrayUsingDescriptors(sortDescriptors:MIOSortDescriptor[]){
        let objs = _MIOSortDescriptorSortObjects(this.allObjects, sortDescriptors);
        return objs;
    }
    
    // Prevent KVO on special properties
    addObserver(obs, keypath:string, context?){
        if (keypath == "count" || keypath == "length") throw new Error("MIOSet: Can't observe count. It's not KVO Compilant"); 
        super.addObserver(obs, keypath, context);
    }

    _reset(){
        this.relationshipFault = true;
        this.objects = [];
        this.objectIDs = [];
    }

    intersection(set:MIOManagedObjectSet) : MIOManagedObjectSet {
        let intersect = MIOManagedObjectSet._setWithManagedObject(this.mo, this.relationship);

        for (let index = 0; index < set.count; index++) {
            let obj = set.objectAtIndex(index);
            if (this.containsObject(obj)) intersect.addObject(obj);
        }

        return intersect;
    }

    subtracting(set:MIOManagedObjectSet) : MIOManagedObjectSet {
        let substract = MIOManagedObjectSet._setWithManagedObject(this.mo, this.relationship);
 
        for (let index = 0; index < this.count; index++) {
            let obj = this.objectAtIndex(index);
            if (set.containsObject(obj) == false) substract.addObject(obj);
        }

        return substract;
    }

    map(block: (e:T, index:number, s:MIOManagedObjectSet<T>) => any) {
        let array = [];
        for(let index = 0; index < this.count; index++){ 
            let obj = this.objectAtIndex(index);
            let mapValue = block(obj, index, this);
            array.addObject(mapValue);
        }
        return array;
    }

    copy() : MIOManagedObjectSet {

        let set = MIOManagedObjectSet._setWithManagedObject(this.mo, this.relationship);

        for (let index = 0; index < this.count; index++) {
            let obj = this.objectAtIndex(index);
            set.addObject(obj);
        }

        return set;

    }

}
