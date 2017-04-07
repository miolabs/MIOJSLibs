/**
 * Created by godshadow on 12/3/16.
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
function MUIImageViewFromElementID(view, elementID) {
    var layer = MUILayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;
    var iv = new MUIImageView();
    iv.initWithLayer(layer);
    view._linkViewToSubview(iv);
    return iv;
}
var MUIImageView = (function (_super) {
    __extends(MUIImageView, _super);
    function MUIImageView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._imageLayer = null;
        return _this;
    }
    MUIImageView.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        this._imageLayer = MUILayerGetFirstElementWithTag(this.layer, "IMG");
        if (this._imageLayer == null) {
            this._imageLayer = document.createElement("img");
            this._imageLayer.style.width = "100%";
            this._imageLayer.style.height = "100%";
            this.layer.appendChild(this._imageLayer);
        }
    };
    MUIImageView.prototype.setImage = function (imageURL) {
        this._imageLayer.setAttribute("src", imageURL);
    };
    return MUIImageView;
}(MUIView));
