/**
 * Created by godshadow on 15/3/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOCore.ts" />
function MIOTextAreaFromElementID(view, elementID) {
    var layer = MIOLayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;
    var ta = new MIOTextArea();
    ta.initWithLayer(layer);
    view._linkViewToSubview(ta);
    return ta;
}
var MIOTextArea = (function (_super) {
    __extends(MIOTextArea, _super);
    function MIOTextArea() {
        _super.call(this);
        this.textareaLayer = null;
    }
    MIOTextArea.prototype.init = function () {
        _super.prototype.init.call(this);
        this._setupLayer();
    };
    MIOTextArea.prototype.initWithLayer = function (layer) {
        _super.prototype.initWithLayer.call(this, layer);
        this._setupLayer();
    };
    MIOTextArea.prototype._setupLayer = function () {
        this.textareaLayer = document.createElement("textarea");
        this.textareaLayer.style.width = "100%";
        this.textareaLayer.style.height = "100%";
        this.textareaLayer.backgroundColor = "transparent";
        this.layer.appendChild(this.textareaLayer);
    };
    return MIOTextArea;
}(MIOControl));
//# sourceMappingURL=MIOTextArea.js.map