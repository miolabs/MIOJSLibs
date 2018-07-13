import * as request from "request";

function wrapOnload(instance, delegate, completion, target) {
    return function onload(err, httpResponse, body) {
        if(!err && httpResponse.statusCode == 200 && body != null){
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
    }
}

export function MIOHTTPRequest(instance, urlString: string, headers, method, body, binary, delegate, target, completion, download: boolean) {
    // Add headers
    const requestHeaders = {};
    for (let item of headers) {
        requestHeaders[item["Field"]] = item["Value"];
    }

    const callback = wrapOnload(instance, delegate, completion, target);

    if (method === "GET" || !body) {
        request.get({
                headers: requestHeaders,
                url: urlString
        }, 
        callback);
    } else {
        request.post({
            headers: requestHeaders,
            json: body,
            url: urlString
        }, 
        callback);
    }
}
