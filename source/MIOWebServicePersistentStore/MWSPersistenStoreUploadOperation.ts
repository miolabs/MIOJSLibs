/// <reference path="../MIOFoundation/MIOFoundation.ts" />

class MWSPersistenStoreUploadOperation extends MIOOperation {

    request:MWSJSONRequest = null;

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
//        console.log("*******************");
        //console.log("MWPSUploadOperation: " + this.httpMethod + " " + this.url.absoluteString);
        // if (this.body != null)
        //     console.log("MWSPersistenStoreUploadOperation: " + JSON.stringify(this.body));
        // console.log("*******************");
        // this.delegate.sendRequest(this.url, this.body, this.httpMethod, this, function(statusCode, json){            
            
        //     console.log("*******************");
        //     console.log("MWSPersistenStoreUploadOperation: Server response " + statusCode);
        //     console.log("*******************");

        //     this.responseCode = statusCode;
        //     this.responseJSON = json;
            
        //     this.setUploading(false);
        //     this.setUploaded(true);
        // });

        this.request.send(this, function (code, data) {
            let [result] = this.delegate.requestDidFinishForWebStore(this, null, code, data);
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