/**
 * Created by godshadow on 12/3/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOView.ts" />
function MIOImageViewFromElementID(view, elementID) {
    var layer = MIOLayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;
    var iv = new MIOImageView();
    iv.initWithLayer(layer);
    view._linkViewToSubview(iv);
    return iv;
}
var MIOImageView = (function (_super) {
    __extends(MIOImageView, _super);
    function MIOImageView() {
        _super.apply(this, arguments);
        this._imageLayer = null;
    }
    MIOImageView.prototype._customizeLayerSetup = function () {
        _super.prototype._customizeLayerSetup.call(this);
        this._imageLayer = MIOLayerGetFirstElementWithTag(this.layer, "IMG");
        if (this._imageLayer == null) {
            this._imageLayer = document.createElement("img");
            this._imageLayer.style.width = "100%";
            this._imageLayer.style.height = "100%";
            this.layer.appendChild(this._imageLayer);
        }
    };
    MIOImageView.prototype.setImage = function (imageURL) {
        this._imageLayer.setAttribute("src", imageURL);
    };
    return MIOImageView;
}(MIOView));
