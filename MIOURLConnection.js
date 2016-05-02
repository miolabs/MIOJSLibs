/**
 * Created by godshadow on 14/3/16.
 */
var MIOURLRequest = (function () {
    function MIOURLRequest(url) {
        this.url = null;
        this.httpMethod = "GET";
        this.body = null;
        this.url = url;
    }
    return MIOURLRequest;
})();
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
        var instance = this;
        this.xmlHttpRequest = new XMLHttpRequest();
        this.xmlHttpRequest.onload = function () {
            if (this.status == 200 && this.responseText != null) {
                // success!
                if (instance.delegate != null)
                    instance.delegate.connectionDidReceiveData(instance, this.responseText);
                else if (instance.blockFN != null)
                    instance.blockFN.call(instance.blockTarget, false, this.responseText);
            }
            else {
                // something went wrong
                if (instance.delegate != null)
                    instance.delegate.connectionDidFail(instance);
                else if (instance.blockFN != null)
                    instance.blockFN.call(instance.blockTarget, true, null);
            }
        };
        this.xmlHttpRequest.open(this.request.httpMethod, this.request.url);
        if (this.request.httpMethod == "POST" && this.request.body != null)
            this.xmlHttpRequest.send(this.request.body);
        else
            this.xmlHttpRequest.send();
    };
    return MIOURLConnection;
})();
//# sourceMappingURL=MIOURLConnection.js.map