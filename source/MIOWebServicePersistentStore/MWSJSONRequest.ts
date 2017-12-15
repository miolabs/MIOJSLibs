
/// <reference path="MWSRequest.ts" />

class MWSJSONRequest extends MWSRequest 
{    
    willStart() {        
        this.setHeaderValue("application/json", "Content-Type");
        
        if (this.body != null) {
            this.bodyData = JSON.stringify(this.body);
        }
    }
    
    didFinish(){
        if (this.resultData != null) {
            this.resultData = JSON.parse(this.resultData.replace(/(\r\n|\n|\r)/gm, ""));
        }
    }
}