import { XMLHttpRequest } from "xmlhttprequest";

export function MIOHTTPRequest(instance, urlString: string, headers, method, body, binary, delegate, target, completion, download: boolean) {
    let xhr = new XMLHttpRequest();

    xhr.onload = function () {
        const body = this.responseText;
        if(this.status < 300 && body != null){
            // Success!
            if (delegate != null) {
                delegate.connectionDidReceiveText(instance, body);
            } else if (target != null) {
                completion.call(target, this.status, body);
            }
        } else {
            // something went wrong
            if (delegate != null) {
                delegate.connectionDidFail(instance);
            } else if (target != null) {
                completion.call(target, this.status, body);
            }
        }
    };
    xhr.open(method, urlString);

    // Add headers
    for (let count = 0; count < headers.length; count++) {
        let item = headers[count];
        xhr.setRequestHeader(item["Field"], item["Value"]);
    }
    if (binary == true) {
        xhr.responseType = "arraybuffer";
    } 
    if (method == "GET" || body == null) {
        xhr.send();
    } else {
        xhr.send(body);
    }
}


export function MIOHTTPSendSynchronousRequest(urlString: string, headers, method, body, binary) {

    let xhr = new XMLHttpRequest();    
    xhr.open(method, urlString, false);

    // Add headers
    for (let count = 0; count < headers.length; count++) {
        let item = headers[count];
        xhr.setRequestHeader(item["Field"], item["Value"]);
    }
    
    if (binary == true) {
        xhr.responseType = "arraybuffer";
    } 
    if (method == "GET" || body == null) {
        xhr.send();
    } else {
        xhr.send(body);
    }

    return xhr.responseText;
}