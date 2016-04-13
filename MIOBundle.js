/**
 * Created by godshadow on 9/4/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOCore.ts" />
var MIOBundle = (function (_super) {
    __extends(MIOBundle, _super);
    function MIOBundle() {
        _super.call(this);
    }
    MIOBundle.prototype.loadFromResource = function (url) {
        var conn = MIOURLConnection();
        conn.initWithRequest(new MIOURLRequest(url), this);
    };
    MIOBundle.prototype.connectionDidReceiveData = function (error, data) {
        if (error == true || data == null || data.length == 0)
            var parser = new DOMParser();
        var html = parser.parseFromString(data, "text/html");
        //var styles = html.styleSheets;
        //if (css != null)
        //MIOCoreLoadStyle(css);
        return (html.getElementById(elementID));
    };
    return MIOBundle;
})(MIOObject);
//# sourceMappingURL=MIOBundle.js.map