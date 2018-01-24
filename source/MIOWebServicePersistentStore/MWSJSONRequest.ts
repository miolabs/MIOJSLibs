
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
        if (this.resultData != null && this.resultData != "") {
            try {
                this.resultData = JSON.parse(this.resultData.replace(/(\r\n|\n|\r)/gm, ""));    
            } catch (error) {
                MIOLog("JSON PARSER ERROR: BODY -> " + this.bodyDate);
                MIOLog("JSON PARSER ERROR: RESULT -> " + this.resultData);
            }
            
        }
    }
}