import { MIOObject, MIOURL, MIOURLRequest, MIOURLConnection, MIONotificationCenter, MIOUUID } from "../MIOFoundation";
import { MWSPersistentStoreResultType } from "./MWSPersistentStore";

export enum MWSRequestType {
    Fetch,
    Save
}

export class MWSRequest extends MIOObject
{
    url:MIOURL|null = null;
    httpMethod = "GET"
    body = null;
    bodyData = null;    

    resultCode = 0
    resultData = null;

    type = MWSRequestType.Fetch;
    
    transaction:string = MIOUUID.UUID().UUIDString;
    schema:string|null = null;
    
    private urlRequest:MIOURLRequest|null = null;
    initWithURL(url:MIOURL, body?, httpMethod?:string){
        
        this.url = url;
        this.body = body;
        if (httpMethod != null) this.httpMethod = httpMethod;
    }

    headers = {};
    setHeaderValue(value:string, key:string) {
        this.headers[key] = value;
    }    

    // Completion block (Int, Any?) -> Void
    execute(target, completion?){
        
        MIONotificationCenter.defaultCenter().postNotification("MWSRequestSentFetch", this);
        this.willStart()

        this.urlRequest = MIOURLRequest.requestWithURL(this.url);      

        for (let key in this.headers) {
            let value = this.headers[key];
            this.urlRequest.setHeaderField(key, value);
        }    
        
        this.urlRequest.httpMethod = this.httpMethod;
        this.urlRequest.httpBody = this.bodyData;
        
        let con = new MIOURLConnection();
        con.initWithRequestBlock(this.urlRequest, this, function(code, data, blob, responseHeaders){

            let headers = responseHeaders || {};
            // let resultType = MWSPersistentStoreResultType.Nested;
            let resultType = headers["result-type"] == "flat" ? MWSPersistentStoreResultType.Flat : MWSPersistentStoreResultType.Nested;

            if (code < 200 || code >= 300) {
                MIONotificationCenter.defaultCenter().postNotification("MWSRequestFetchError", this, {"Type" : this.type});
            }
            this.resultCode = code;
            this.resultData = data;

            this.didFinish();

            if (completion != null){
                completion.call(target, code, this.resultData, resultType);
            }

            MIONotificationCenter.defaultCenter().postNotification("MWSRequestReceivedFetch", this);
        });
    }

     // For subclasing
    protected willStart(){ this.bodyData = this.body; }
    protected didFinish(){}
}