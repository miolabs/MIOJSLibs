/**
 * Created by godshadow on 14/3/16.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/// <reference path="MIOURL.ts" />
var MIOURLRequest = (function (_super) {
    __extends(MIOURLRequest, _super);
    function MIOURLRequest() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.url = null;
        _this.httpMethod = "GET";
        _this.body = null;
        _this.headers = [];
        return _this;
    }
    MIOURLRequest.requestWithURL = function (url) {
        var request = new MIOURLRequest();
        request.initWithURL(url);
        return request;
    };
    MIOURLRequest.prototype.initWithURL = function (url) {
        this.url = url;
    };
    MIOURLRequest.prototype.setHeaderField = function (field, value) {
        this.headers.push({ "Field": field, "Value": value });
    };
    return MIOURLRequest;
}(MIOObject));
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
        var urlString = this.request.url.absoluteString;
        this.xmlHttpRequest.open(this.request.httpMethod, urlString);
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
