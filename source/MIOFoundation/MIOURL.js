/// <reference path="MIOObject.ts" />
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
var MIOURLTokenType;
(function (MIOURLTokenType) {
    MIOURLTokenType[MIOURLTokenType["Protocol"] = 0] = "Protocol";
    MIOURLTokenType[MIOURLTokenType["Host"] = 1] = "Host";
    MIOURLTokenType[MIOURLTokenType["Path"] = 2] = "Path";
    MIOURLTokenType[MIOURLTokenType["Param"] = 3] = "Param";
    MIOURLTokenType[MIOURLTokenType["Value"] = 4] = "Value";
})(MIOURLTokenType || (MIOURLTokenType = {}));
var MIOURL = (function (_super) {
    __extends(MIOURL, _super);
    function MIOURL() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.baseURL = null;
        _this.absoluteString = null;
        _this.scheme = null;
        _this.user = null;
        _this.password = null;
        _this.host = null;
        _this.port = 0;
        _this.hostname = null;
        _this.path = "/";
        _this.file = null;
        _this.pathExtension = null;
        _this.params = [];
        return _this;
    }
    MIOURL.urlWithString = function (urlString) {
        var url = new MIOURL();
        url.initWithURLString(urlString);
        return url;
    };
    MIOURL.prototype.initWithURLString = function (urlString) {
        this.absoluteString = urlString;
        this._parseURLString(urlString);
    };
    MIOURL.prototype._parseURLString = function (urlString) {
        var param = "";
        var value = "";
        var token = "";
        var step = MIOURLTokenType.Protocol;
        var foundPort = false;
        var foundExt = false;
        for (var index = 0; index < urlString.length; index++) {
            var ch = urlString.charAt(index);
            if (ch == ":") {
                if (step == MIOURLTokenType.Protocol) {
                    this.scheme = token;
                    token = "";
                    index += 2; //Igonring the double slash // from the protocol (http://)
                    step = MIOURLTokenType.Host;
                }
                else if (step == MIOURLTokenType.Host) {
                    this.hostname = token;
                    token = "";
                    foundPort = true;
                }
            }
            else if (ch == "/") {
                if (step == MIOURLTokenType.Host) {
                    if (foundPort == true) {
                        this.host = this.hostname + ":" + token;
                        this.port = parseInt(token);
                    }
                    else {
                        this.host = token;
                        this.hostname = token;
                    }
                    step = MIOURLTokenType.Path;
                }
                else {
                    this.path += token + ch;
                }
                token = "";
            }
            else if (ch == ".") {
                if (step == MIOURLTokenType.Path) {
                    this.file = token;
                    foundExt = true;
                    token = "";
                }
            }
            else if (ch == "?") {
                if (foundExt == true) {
                    this.file += "." + token;
                    this.pathExtension = token;
                }
                else
                    this.file = token;
                token = "";
                step = MIOURLTokenType.Param;
            }
            else if (ch == "&") {
                var item = { "Key": param, "Value": value };
                this.params.push(item);
                step = MIOURLTokenType.Param;
                param = "";
                value = "";
            }
            else if (ch == "=") {
                param = token;
                step = MIOURLTokenType.Value;
                token = "";
            }
            else {
                token += ch;
            }
        }
        if (token.length > 0) {
            if (step == MIOURLTokenType.Path) {
                if (foundExt == true) {
                    this.file += "." + token;
                    this.pathExtension = token;
                }
                else
                    this.path += token;
            }
            else if (step == MIOURLTokenType.Param) {
                var i = { "key": token };
                this.params.push(i);
            }
            else if (step == MIOURLTokenType.Value) {
                var item = { "Key": param, "Value": token };
                this.params.push(item);
            }
        }
    };
    MIOURL.prototype.urlByAppendingPathComponent = function (path) {
        var urlString = this.scheme + "://" + this.host + this.path;
        if (path.charAt(0) != "/")
            urlString += path;
        else
            urlString += path.substr(1);
        var newURL = MIOURL.urlWithString(urlString);
        return newURL;
    };
    MIOURL.prototype.standardizedURL = function () {
        return null;
    };
    return MIOURL;
}(MIOObject));
