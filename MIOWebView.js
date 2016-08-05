/**
 * Created by godshadow on 04/08/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOView.ts" />
var MIOWebView = (function (_super) {
    __extends(MIOWebView, _super);
    function MIOWebView() {
        _super.apply(this, arguments);
    }
    MIOWebView.prototype.init = function () {
        this.layer = document.createElement("iframe");
        this.layer.setAttribute("id", this.layerID);
        this.layer.style.position = "absolute";
        this.layer.style.top = "0px";
        this.layer.style.left = "0px";
        this.layer.style.width = "100%";
        this.layer.style.height = "100%";
    };
    MIOWebView.prototype.setURL = function (url) {
        this.layer.setAttribute("src", url);
    };
    return MIOWebView;
}(MIOView));
//# sourceMappingURL=MIOWebView.js.map