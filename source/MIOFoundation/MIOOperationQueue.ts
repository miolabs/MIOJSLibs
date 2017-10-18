
/// <reference path="MIOObject.ts" />
/// <reference path="MIOOperation.ts" />


class MIOOperationQueue extends MIOObject {

    private operations = [];

    addOperation(operation: MIOOperation) {

        if (operation.isFinished == true) {
            throw ("MIOOperationQueue: Tying to add an operation already finished");
        }

        this.operations.push(operation);
        if (operation.ready == false) {
            operation.addObserver(this, "ready", null);
        }
        else {
            operation.addObserver(this, "isFinished", null);
            operation.start();
        }
    }

    removeOperation(operation:MIOOperation) {

        let index = this.operations.indexOf(operation);
        if (index == -1) return;

        this.operations.splice(index, 1);
    }

    observeValueForKeyPath(keyPath: string, type: string, object, ctx) {

        if (type != "did") return;

        if (keyPath == "ready") {
            let op:MIOOperation = object; 
            if (op.ready == true) {
                op.removeObserver(this, "ready");
                op.addObserver(this, "isFinished", null);
                op.start();
            }
        }
        else if (keyPath == "isFinished"){
            let op:MIOOperation = object; 
            if (op.isFinished == true) {
                op.removeObserver(this, "isFinished");
                this.removeOperation(op);
                if (op.target != null && op.completion != null)
                op.completion.call(op.target);    
            }
        }
    }


}