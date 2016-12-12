/**
 * Created by godshadow on 14/3/16.
 */
var MIOURLRequest = (function () {
    function MIOURLRequest(url) {
        this.url = null;
        this.httpMethod = "GET";
        this.body = null;
        this.headers = [];
        this.url = url;
    }
    MIOURLRequest.prototype.setHeaderField = function (field, value) {
        this.headers.push({ "Field": field, "Value": value });
    };
    return MIOURLRequest;
}());
var MIOURLConnection = (function () {
    function MIOURLConnection() {
        this.request = null;
        this.delegate = null;
        this.blockFN = null;
        this.blockTarget = null;
        this.xmlHttpRequest = null;
    }
    MIOURLConnection.prototype.initWithRequest = function (request, delegate) {
        this.request = request;
        this.delegate = delegate;
        this.start();
    };
    MIOURLConnection.prototype.initWithRequestBlock = function (request, blockTarget, blockFN) {
        this.request = request;
        this.blockFN = blockFN;
        this.blockTarget = blockTarget;
        this.start();
    };
    MIOURLConnection.prototype.start = function () {
        this.xmlHttpRequest = new XMLHttpRequest();
        var instance = this;
        this.xmlHttpRequest.onload = function () {
            if (this.status >= 200 && this.status <= 300) {
                // success!
                if (instance.delegate != null)
                    instance.delegate.connectionDidReceiveData(instance, this.responseText);
                else if (instance.blockFN != null)
                    instance.blockFN.call(instance.blockTarget, this.status, this.responseText);
            }
            else {
                // something went wrong
                if (instance.delegate != null)
                    instance.delegate.connectionDidFail(instance);
                else if (instance.blockFN != null)
                    instance.blockFN.call(instance.blockTarget, this.status, null);
            }
        };
        this.xmlHttpRequest.open(this.request.httpMethod, this.request.url);
        // Add headers
        for (var count = 0; count < this.request.headers.length; count++) {
            var item = this.request.headers[count];
            this.xmlHttpRequest.setRequestHeader(item["Field"], item["Value"]);
        }
        if (this.request.httpMethod == "GET" || this.request.body == null)
            this.xmlHttpRequest.send();
        else
            this.xmlHttpRequest.send(this.request.body);
    };
    return MIOURLConnection;
}());
//# sourceMappingURL=MIOURLConnection.js.map