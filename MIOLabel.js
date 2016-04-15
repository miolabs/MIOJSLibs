/**
 * Created by godshadow on 11/3/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOView.ts" />
function MIOLabelFromElementID(view, elementID) {
    var layer = MIOLayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;
    var label = new MIOLabel();
    label.initWithLayer(layer);
    view._linkViewToSubview(label);
    return label;
}
var MIOLabel = (function (_super) {
    __extends(MIOLabel, _super);
    function MIOLabel() {
        _super.call(this);
        this.text = null;
        this.textLayer = null;
        this.autoAdjustFontSize = "none";
        this.autoAdjustFontSizeValue = 4;
    }
    MIOLabel.prototype.init = function () {
        _super.prototype.init.call(this);
        this._setupLayer();
    };
    MIOLabel.prototype.initWithLayer = function (layer) {
        _super.prototype.initWithLayer.call(this, layer);
        this._setupLayer();
    };
    MIOLabel.prototype._setupLayer = function () {
        this.textLayer = document.createElement("span");
        this.textLayer.classList.add("label_style");
        this.layer.appendChild(this.textLayer);
    };
    MIOLabel.prototype.layout = function () {
        _super.prototype.layout.call(this);
        //var h = this.getHeight();
        //this.textLayer.style.lineHeight = h + "px";
        if (this.autoAdjustFontSize == "width") {
            var w = this.getWidth();
            var size = w / this.autoAdjustFontSizeValue;
            this.layer.style.fontSize = size + 'px';
            var maxSize = this.getHeight();
            if (size > maxSize)
                this.layer.style.fontSize = maxSize + 'px';
            else
                this.layer.style.fontSize = size + 'px';
        }
        else if (this.autoAdjustFontSize == "height") {
            var h = this.getHeight();
            var size = h / this.autoAdjustFontSizeValue;
            this.layer.style.fontSize = size + 'px';
            var maxSize = this.getHeight();
            if (size > maxSize)
                this.layer.style.fontSize = maxSize + 'px';
            else
                this.layer.style.fontSize = size + 'px';
        }
    };
    MIOLabel.prototype.setText = function (text) {
        this.text = text;
        this.textLayer.innerHTML = text;
        this.textLayer.innerHTML = text == null ? "" : text;
    };
    MIOLabel.prototype.setTextAlignment = function (alignment) {
        this.layer.style.textAlign = alignment;
    };
    MIOLabel.prototype.setHightlighted = function (value) {
        if (value == true) {
            this.textLayer.classList.add("label_highlighted_color");
        }
        else {
            this.textLayer.classList.remove("label_highlighted_color");
        }
    };
    MIOLabel.prototype.setTextRGBColor = function (r, g, b) {
        var value = "rgb(" + r + ", " + g + ", " + b + ")";
        this.textLayer.style.color = value;
    };
    MIOLabel.prototype.setFontSize = function (size) {
        this.textLayer.style.fontSize = size + "px";
    };
    MIOLabel.prototype.setFontStyle = function (style) {
        this.textLayer.style.fontWeight = style;
    };
    MIOLabel.prototype.setFontFamily = function (fontFamily) {
        this.textLayer.style.fontFamily = fontFamily;
    };
    return MIOLabel;
})(MIOView);
//# sourceMappingURL=MIOLabel.js.map