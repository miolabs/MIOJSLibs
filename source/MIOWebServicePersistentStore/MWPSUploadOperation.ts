
/// <reference path="../MIOFoundation/MIOFoundation.ts" />

class MWPSUploadOperation extends MIOOperation {

    token = null;
    url = null;
    body = null;
    httpMethod = "GET";
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
        this.setUploading(true);
        this.delegate.sendRequest(this.url, this.body, this.httpMethod, this, function(statusCode, json){            
            
            this.responseCode = statusCode;
            this.responseJSON = json;
            
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