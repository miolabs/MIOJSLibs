/**
 * Created by godshadow on 9/4/16.
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
/// <reference path="MIO_Core.ts" />
/// <reference path="MIOObject.ts" />
/// <reference path="MIOURL.ts" />
/// <reference path="MIOBundle_Webworker.ts" />
var MIOBundle = (function (_super) {
    __extends(MIOBundle, _super);
    function MIOBundle() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.url = null;
        _this._webBundle = null;
        return _this;
    }
    MIOBundle.mainBundle = function () {
        if (this._mainBundle == null) {
            // Main url. Getting from broser window url search field
            var url = MIOCoreGetMainBundleURL();
            this._mainBundle = new MIOBundle();
            this._mainBundle.initWithURL(url);
        }
        return this._mainBundle;
    };
    MIOBundle.prototype.initWithURL = function (url) {
        this.url = url;
    };
    MIOBundle.prototype.loadHTMLNamed = function (path, layerID, target, completion) {
        if (MIOCoreGetAppType() == MIOCoreAppType.Web) {
            if (this._webBundle == null) {
                this._webBundle = new MIOBundle_Webworker();
                this._webBundle.baseURL = this.url;
            }
            this._webBundle.loadHMTLFromPath(path, layerID, this, function (layerData) {
                if (target != null && completion != null)
                    completion.call(target, layerData);
            });
        }
    };
    MIOBundle.prototype._loadResourceFromURL = function (url, target, completion) {
        var request = MIOURLRequest.requestWithURL(url);
        var conn = new MIOURLConnection();
        conn.initWithRequestBlock(request, this, function (error, data) {
            completion.call(target, data);
        });
    };
    return MIOBundle;
}(MIOObject));
MIOBundle._mainBundle = null;
