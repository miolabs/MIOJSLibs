import { MIOObject } from "./MIOObject";
import { MIOPredicate, _MIOPredicateFilterObjects } from "./MIOPredicate";

export class MIOSet extends MIOObject {

    static set() {

        let s = new MIOSet();
        s.init();

        return s;
    }

    private _objects = [];

    addObject(object){
        if (this._objects.containsObject(object) == true) return;        
        this._objects.addObject(object);
    }

    removeObject(object){
        if (this._objects.containsObject(object) == false) return;        
        this._objects.removeObject(object);
    }

    removeAllObjects(){
        this._objects = [];
    }

    indexOfObject(object) {
        return this._objects.indexOf(object);
    }

    containsObject(object){
        return this._objects.indexOfObject(object) > -1 ? true : false;
    }

    objectAtIndex(index){
        return this._objects[index];
    }

    get allObjects(){
        return this._objects;
    }

    get count(){
        return this._objects.length;
    }

    get length(){
        return this._objects.length;
    }    

    copy():MIOSet{
         
        let set = new MIOSet();
        set.init();

        for (var index = 0; index < this._objects.length; index++){
            var obj = this._objects[index];
            set.addObject(obj);
        }

        return set;
    }

    filterWithPredicate(predicate:MIOPredicate) {
        var objs = _MIOPredicateFilterObjects(this._objects, predicate);
        return objs;
    }

    // Prevent KVO on special properties
    addObserver(obs, keypath:string, context?){
        if (keypath == "count" || keypath == "length") throw new Error("MIOSet: Can't observe count. It's not KVO Compilant"); 
        super.addObserver(obs, keypath, context);
    }
    

}
