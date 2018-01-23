
/// <reference path="MIOObject.ts" />


class MIOSet extends MIOObject {

    static set() {

        let s = new MIOSet();
        s.init();

        return s;
    }

    private _objects = [];

    addObject(object){
        if (this.containsObject(object) == true) return;
        
        this.willChangeValue("length");
        this._objects.addObject(object);
        this.didChangeValue("length");
    }

    removeObject(object){
        let index = this.indexOfObject(object);
        if (index == -1) return;
        
        this.willChangeValue("length");
        this._objects.removeObjectAtIndex(index);
        this.didChangeValue("length");
    }

    removeAllObjects(){
        this.willChangeValue("length");        
        this._objects = [];
        this.didChangeValue("length");
    }

    indexOfObject(object) {
        return this._objects.indexOf(object);
    }

    containsObject(object){
        return this.indexOfObject(object) > -1 ? true : false;
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
        if (keypath == "count" || keypath == "length") throw "MIOSet: Can't observe count. It's not KVO Compilant";        
        super.addObserver(obj, keypath, context);
    }
    

}
