/**
 * Created by godshadow on 04/08/16.
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
/// <reference path="MUIView.ts" />
var MUIWebView = (function (_super) {
    __extends(MUIWebView, _super);
    function MUIWebView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._iframeLayer = null;
        return _this;
    }
    MUIWebView.prototype.init = function () {
        _super.prototype.init.call(this);
        this._iframeLayer = document.createElement("iframe");
        this._iframeLayer.setAttribute("scrolling", "auto");
        this._iframeLayer.setAttribute("frameborder", "0");
        this.layer.appendChild(this._iframeLayer);
    };
    MUIWebView.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        this._iframeLayer = MUILayerGetFirstElementWithTag(this.layer, "IFRAME");
        if (this._iframeLayer == null) {
            this._iframeLayer.setAttribute("scrolling", "auto");
            this._iframeLayer.setAttribute("frameborder", "0");
            this.layer.appendChild(this._iframeLayer);
        }
    };
    MUIWebView.prototype.setURL = function (url) {
        this._iframeLayer.setAttribute("src", url);
        this._iframeLayer.setAttribute("width", "100%");
        this._iframeLayer.setAttribute("height", "100%");
    };
    return MUIWebView;
}(MUIView));
