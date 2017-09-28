
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
            if (statusCode == 200){
                if (data != null)
                    json = JSON.parse(data.replace(/(\r\n|\n|\r)/gm, ""));                
            }
            else if (statusCode == 401) {                
                let error = {"Code": statusCode, "error" : "Invalid token. The user need to login again"};
                MIONotificationCenter.defaultCenter().postNotification("MIOWebServiceError", error);
            }
            else if (statusCode == 422) {
                let error = {"Code": statusCode, "error" : "Unprocessable Entity. Check the value of the parameters you send it"};
                MIONotificationCenter.defaultCenter().postNotification("MIOWebServiceError", error);
            }
            else {            
                let error = {"Code": statusCode, "error" : "Conection error. Check internet and server conections"};                
                MIONotificationCenter.defaultCenter().postNotification("MIOWebServiceError", error);
            }   
            
            completion.call(target, statusCode, json);
        });
    }
}