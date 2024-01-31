import { MIOObject } from "./MIOObject";
import { MIOOperation } from "./MIOOperation";

export class MIOOperationQueue extends MIOObject {

    private _operations:MIOOperation[] = [];

    maxConcurrentOperationCount = -1; //NSOperationQueueDefaultMaxConcurrentOperationCount

    addOperation(operation: MIOOperation) {

        if (operation.isFinished == true) {
            throw new Error("MIOOperationQueue: Tying to add an operation already finished");
        }

        this.willChangeValue("operationCount");
        this.willChangeValue("operations");
        this._operations.addObject(operation);        
        this.didChangeValue("operationCount");                    
        this.didChangeValue("operations");        

        if (operation.ready == false) {
            operation.addObserver(this, "ready", null);
        }
        else {
            operation.addObserver(this, "isFinished", null);
            //if (this.suspended == false) operation.start();
            this.checkOperationQueue();
        }
    }

    removeOperation(operation:MIOOperation) {

        let index = this._operations.indexOf(operation);
        if (index == -1) return;

        this.willChangeValue("operationCount");
        this.willChangeValue("operations");
        this._operations.splice(index, 1);
        this.didChangeValue("operationCount");                    
        this.didChangeValue("operations");        
    }

    get operations(){
        return this._operations;
    }

    get operationCount(){
        return this._operations.length;
    }

    private _suspended = false;
    set suspended(value){
        this.setSupended(value);
    }
    get suspended(){
        return this._suspended;
    }

    private setSupended(value){
        if (this._suspended == value) return;

        this._suspended = value;
        // if the value is false, we don't need to do anything
        if (value == true) return;

        // This means we need to re-active every operation
        // for(let index = 0; index < this.operations.length; index++){
        //     let op:MIOOperation = this.operations[index];
        //     if (op.ready == true) op.start();
        // }
        this.checkOperationQueue();
    }

    private operationExecutingCount = 0;
    private checkOperationQueue() {
        if (this.suspended) return;

        for(let index = 0; index < this.operations.length; index++){
            let op:MIOOperation = this.operations[index];
            if (op.ready == false) continue; 
            if (op.isExecuting == true) continue;

            if (this.maxConcurrentOperationCount == -1 || this.maxConcurrentOperationCount == 0) {
                op.start();
            }
            else if (this.operationExecutingCount < this.maxConcurrentOperationCount) {
                this.operationExecutingCount++;
                op.start();
            }            
        }

    }

    observeValueForKeyPath(keyPath: string, type: string, object, ctx) {

        if (type != "did") return;

        if (keyPath == "ready") {
            let op:MIOOperation = object; 
            if (op.ready == true) {
                op.removeObserver(this, "ready");
                op.addObserver(this, "isFinished", null);
                //if (this.suspended == false) op.start();
                this.checkOperationQueue();
            }
        }
        else if (keyPath == "isFinished"){
            let op:MIOOperation = object; 
            if (op.isFinished == true) {
                op.removeObserver(this, "isFinished");
                this.removeOperation(op);
                if (op.target != null && op.completion != null)
                op.completion.call(op.target);
                this.operationExecutingCount--;
                this.checkOperationQueue();
            }
        }
    }

}