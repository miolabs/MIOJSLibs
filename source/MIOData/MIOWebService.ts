
/// <reference path="../MIOFoundation/MIOFoundation.ts" />

class MIOWebService extends MIOObject {

    token = null;

    sendRequest(url:MIOURL, body, httpMethod:string, target?, completion?) {

        let request = MIOURLRequest.requestWithURL(url);
        
        // Setup headers
        if (this.token != null)
            request.setHeaderField("Authorization", "Bearer " + this.token);
        request.setHeaderField("Content-Type", "application/json");

        if (body != null)
            request.body = JSON.stringify(body);        
        request.httpMethod = httpMethod;

        var urlConnection = new MIOURLConnection();
        urlConnection.initWithRequestBlock(request, this, function(statusCode, data){                    
        
            var json = null;
            var error = null;
            if (statusCode == 200){
                if (data != null)
                    json = JSON.parse(data.replace(/(\r\n|\n|\r)/gm, ""));                
            }
            else if (statusCode == 401) {                
                error = {"Code": statusCode, "Error" : "Invalid token. The user need to login again"};
                MIONotificationCenter.defaultCenter().postNotification("MIOWebServiceError", error);
            }
            else if (statusCode == 422) {
                error = {"Code": statusCode, "Error" : "Unprocessable Entity. Check the value of the parameters you send it"};
                MIONotificationCenter.defaultCenter().postNotification("MIOWebServiceError", error);
            }
            else {            
                error = {"Code": statusCode, "Error" : "Conection error. Check internet and server status"};                
                MIONotificationCenter.defaultCenter().postNotification("MIOWebServiceError", error);
            }   
            
            if (error != null) {                
                console.log("MIOWebserice: " + request.httpMethod + ": " + request.url.absoluteString);
                console.log("MIOWebserice: Error " + error["Code"] + ". " + error["Error"]);
            }
            
            completion.call(target, statusCode, json);
        });
    }
}