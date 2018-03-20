import { MIOObject } from "./MIOObject";

export class MIOOperation extends MIOObject {

    name:string = null;
    target = null;
    completion = null;

    private _dependencies = [];
    get dependencies() {return this._dependencies;}

    private _isExecuting = false;
    get isExecuting() {return this.executing()}
    
    private setExecuting(value){
        if (value == this._isExecuting) return;
        this.willChangeValue("isExecuting");
        this._isExecuting = value;
        this.didChangeValue("isExecuting");
    }

    private _isFinished = false;
    get isFinished() {return this.finished();}
    
    private setFinished(value){
        if (value == this._isFinished) return;        
        this.willChangeValue("isFinished");
        this._isFinished = value;
        this.didChangeValue("isFinished");
    }

    private _ready = true;
    private setReady(value){
        if (value == this._ready) return;        
        this.willChangeValue("ready");
        this._ready = value;
        this.didChangeValue("ready");
    }
    
    get ready() {
        return this._ready;
    }

    addDependency(operation:MIOOperation){
        
        this._dependencies.push(operation);
        if (operation.isFinished == false) {
            operation.addObserver(this, "isFinished");
            this.setReady(false);
        }
    } 

    // Non concurrent task
    main() {}
    
    // Concurrent task
    start() {

        this.setExecuting(true);
        this.main();
        this.setExecuting(false);
        this.setFinished(true);
    }

    executing() {
        return this._isExecuting;
    }

    finished(){
        return this._isFinished;
    }    
    
    observeValueForKeyPath(keyPath:string, type:string, object, ctx) {

        if (type != "did") return;

        if (keyPath == "isFinished") {
            let op:MIOOperation = object;
            if (op.isFinished == true){
                object.removeObserver(this, "isFinished");
                this.checkDependecies();
            }
        }
    }

    private checkDependecies(){

        for (var index = 0; index < this._dependencies.length; index++){
            let op = this._dependencies[index];
            if (op.isFinished == false) return;
        }

        // So if we are in this point, means every dependecy is finished
        // and we can start our own task
        this.setReady(true);
    }
}

class MIOBlockOperation extends MIOOperation {
    
    private executionBlocks = [];

    static operationWithBlock(target, block) {

        let op = new MIOBlockOperation();
        op.init();

    }

    addExecutionBlock(target, block) {

        var item = {};
        item["Target"] = target;
        item["Block"] = block;

        this.executionBlocks.push(item);
    }

    main() {

        for(var index = 0; index < this.executionBlocks.length; index++){
            let item = this.executionBlocks[index];
            let target = item["Target"];
            let block = item["Block"];

            block.call(target);
        }
    }
}
