
/// <reference path="MIOObject.ts" />


class MIOSet extends MIOObject {

    static set() {

        let s = new MIOSet();
        s.init();

        return s;
    }

    private _objects = [];

    addObject(obj){
        let index = this._objects.indexOf(obj);
        if (index > -1) return;
        
        this.willChangeValue("length");
        this._objects.push(obj);
        this.didChangeValue("length");
    }

    removeObject(obj){
        let index = this._objects.indexOf(obj);
        if (index == -1) return;

        this.willChangeValue("length");
        this._objects.splice(index, 1);
        this.didChangeValue("length");
    }

    removeAllObjects(){
        this.willChangeValue("length");        
        this._objects = [];
        this.didChangeValue("length");
    }

    indexOfObject(obj) {
        return this._objects.indexOf(obj);
    }

    objectAtIndex(index)
    {
        return this._objects[index];
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

}
