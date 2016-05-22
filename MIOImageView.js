/**
 * Created by godshadow on 12/3/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOCore.ts" />
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
        _super.call(this);
        this.imageLayer = null;
    }
    MIOImageView.prototype.init = function () {
        _super.prototype.init.call(this);
        this._setupLayer();
    };
    MIOImageView.prototype.initWithLayer = function (layer) {
        _super.prototype.initWithLayer.call(this, layer);
        this._setupLayer();
    };
    MIOImageView.prototype._setupLayer = function () {
        this.imageLayer = document.createElement("img");
        this.imageLayer.style.width = "100%";
        this.imageLayer.style.height = "100%";
        this.layer.appendChild(this.imageLayer);
    };
    MIOImageView.prototype.setImage = function (imageURL) {
        this.imageLayer.setAttribute("src", imageURL);
    };
    return MIOImageView;
})(MIOView);
//# sourceMappingURL=MIOImageView.js.map