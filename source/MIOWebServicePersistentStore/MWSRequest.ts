
/// <reference path="../MIOFoundation/MIOFoundation.ts" />

class MWSRequest extends MIOObject
{
    url:MIOURL = null;
    httpMethod = "GET"
    body = null;
    bodyData = null;
    private headers = {};

    resultCode = 0
    resultData = null;
    
    private urlRequest:MIOURLRequest = null;

    initWithURL(url:MIOURL, body?, httpMethod?:string){
        
        this.url = url;
        this.body = body;
        if (httpMethod != null) this.httpMethod = httpMethod;
    }

    setHeaderValue(value:string, key:string) {
        this.headers[key] = value;
    }

    // Completion block (Int, Any?) -> Void
    send(target, completion?){
        
        this.willStart()

        this.urlRequest = MIOURLRequest.requestWithURL(this.url);      

        for (var key in this.headers) {
            let value = this.headers[key];
            this.urlRequest.setHeaderField(key, value);
        }    
        
        this.urlRequest.httpMethod = this.httpMethod;
        this.urlRequest.httpBody = this.bodyData;
        
        let con = new MIOURLConnection();
        con.initWithRequestBlock(this.urlRequest, this, function(code, data, blob){

            this.resultCode = code;
            this.resultData = data;

            this.didFinish();

            if (completion != null){
                completion.call(target, code, this.resultData);
            }
        });
    }

     // For subclasing
    protected willStart(){}
    protected didFinish(){}
}