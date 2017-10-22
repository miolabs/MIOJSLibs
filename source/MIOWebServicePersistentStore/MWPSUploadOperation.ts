
/// <reference path="../MIOFoundation/MIOFoundation.ts" />

class MWPSUploadOperation extends MIOOperation {

    token = null;
    url:MIOURL = null;
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
        console.log("*******************");
        console.log("MWPSUploadOperation: " + this.httpMethod + " " + this.url.absoluteString);
        if (this.body != null)
            console.log("MWPSUploadOperation: " + JSON.stringify(this.body));
        console.log("*******************");
        this.delegate.sendRequest(this.url, this.body, this.httpMethod, this, function(statusCode, json){            
            
            console.log("*******************");
            console.log("MWPSUploadOperation: Server response " + statusCode);
            console.log("*******************");

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