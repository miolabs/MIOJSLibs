/**
 * Created by godshadow on 11/3/16.
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
var MUILabel = (function (_super) {
    __extends(MUILabel, _super);
    function MUILabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._textLayer = null;
        _this.autoAdjustFontSize = "none";
        _this.autoAdjustFontSizeValue = 4;
        return _this;
    }
    MUILabel.prototype.init = function () {
        _super.prototype.init.call(this);
        this.layer.style.background = "";
        this._setupLayer();
    };
    MUILabel.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        this._textLayer = MUILayerGetFirstElementWithTag(this.layer, "SPAN");
        this._setupLayer();
    };
    MUILabel.prototype._setupLayer = function () {
        if (this._textLayer == null) {
            this.layer.innerHTML = "";
            this._textLayer = document.createElement("span");
            this._textLayer.style.top = "3px";
            this._textLayer.style.left = "3px";
            this._textLayer.style.right = "3px";
            this._textLayer.style.bottom = "3px";
            //this._textLayer.style.font = "inherit";
            //this._textLayer.style.fontSize = "inherit";
            this.layer.appendChild(this._textLayer);
        }
    };
    MUILabel.prototype.layout = function () {
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
    MUILabel.prototype.setText = function (text) {
        this.text = text;
    };
    Object.defineProperty(MUILabel.prototype, "text", {
        set: function (text) {
            this._textLayer.innerHTML = text != null ? text : "";
        },
        enumerable: true,
        configurable: true
    });
    MUILabel.prototype.setTextAlignment = function (alignment) {
        this.layer.style.textAlign = alignment;
    };
    MUILabel.prototype.setHightlighted = function (value) {
        if (value == true) {
            this._textLayer.classList.add("label_highlighted_color");
        }
        else {
            this._textLayer.classList.remove("label_highlighted_color");
        }
    };
    MUILabel.prototype.setTextRGBColor = function (r, g, b) {
        var value = "rgb(" + r + ", " + g + ", " + b + ")";
        this._textLayer.style.color = value;
    };
    MUILabel.prototype.setFontSize = function (size) {
        this._textLayer.style.fontSize = size + "px";
    };
    MUILabel.prototype.setFontStyle = function (style) {
        this._textLayer.style.fontWeight = style;
    };
    MUILabel.prototype.setFontFamily = function (fontFamily) {
        this._textLayer.style.fontFamily = fontFamily;
    };
    return MUILabel;
}(MUIView));
