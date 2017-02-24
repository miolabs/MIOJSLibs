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
        this._iframeLayer = null;
    }
    MIOWebView.prototype.init = function () {
        _super.prototype.init.call(this);
        this._iframeLayer = document.createElement("iframe");
        this._iframeLayer.setAttribute("scrolling", "auto");
        this._iframeLayer.setAttribute("frameborder", "0");
        this.layer.appendChild(this._iframeLayer);
    };
    MIOWebView.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        this._iframeLayer = MIOLayerGetFirstElementWithTag(this.layer, "IFRAME");
        if (this._iframeLayer == null) {
            this._iframeLayer.setAttribute("scrolling", "auto");
            this._iframeLayer.setAttribute("frameborder", "0");
            this.layer.appendChild(this._iframeLayer);
        }
    };
    MIOWebView.prototype.setURL = function (url) {
        this._iframeLayer.setAttribute("src", url);
        this._iframeLayer.setAttribute("width", "100%");
        this._iframeLayer.setAttribute("height", "100%");
    };
    return MIOWebView;
}(MIOView));
