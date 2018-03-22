import { MIOOperation } from "../MIOFoundation";
import { MWSJSONRequest } from "./MWSJSONRequest";

export class MWSPersistenStoreOperation extends MIOOperation {
        
    saveCount = 0;
    request:MWSJSONRequest = null;
    dependencyIDs = null;

    responseCode = null;
    responseJSON = null;

    private delegate = null;    
    
    private uploading = false;
    private setUploading(value){
        this.willChangeValue("isExecuting");
        this.uploading = value;
        this.didChangeValue("isExecuting");
    }

    private uploaded = false;
    private setUploaded(value){
        this.willChangeValue("isFinished");
        this.uploaded = value;
        this.didChangeValue("isFinished");
    }

    initWithDelegate(delegate) {
        this.init();
        this.delegate = delegate;
    }

    start() {
        if (this.uploading == true) throw new Error("MWSPersistenStoreUploadOperation: Trying to start again on an executing operation");

        this.setUploading(true);

        this.request.send(this, function (code, data) {
            this.responseCode = code;
            this.responseJSON = data;            

            this.setUploading(false);
            this.setUploaded(true);            
        });        
    }

    executing(){
        return this.uploading;
    }

    finished(){
        return this.uploaded;
    }

}