interface Array<T> {
    addObject(o: T): void;
    insertObjectAtIndex(object:any, index:number): void ;
    removeObject  (object:any): void ;
    removeObjectAtIndex  (index:number) : void ;
    indexOfObject  (object:any): number ;
    containsObject  (object:any): boolean ;
    objectAtIndex  (index:number): any ;
    firstObject () : T ;
    lastObject  () : T ;
}

//For code completion the interface is defined in types/mio/index.d.ts

Array.prototype.addObject = function(object:any){
    this.push(object);
}

Array.prototype.insertObjectAtIndex = function(object:any, index:number){
    this.splice(index, 0, object);
}

Array.prototype.removeObject = function(object:any){
    let index = this.indexOf(object);
    if (index > -1) {
        this.splice(index, 1);
    }
}

Array.prototype.removeObjectAtIndex = function(index:number) {        
    this.splice(index, 1);    
}

Array.prototype.indexOfObject = function(object:any): number {
    return this.indexOf(object);
}

Array.prototype.containsObject = function(object:any): boolean {
    let index = this.indexOf(object);
    return index > -1 ? true : false;
}

Array.prototype.objectAtIndex = function(index:number): any {        
    return this[index];
}

Object.defineProperty(Array.prototype, "count", {
    get: function () {
        return this.length;
    },
    enumerable: true,
    configurable: true
})

Array.prototype.firstObject = function(){
    return this[0];
}

Array.prototype.lastObject = function(){
    return this[this.count - 1];
}
