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
/// <reference path="MUIControl.ts" />
var MUITextFieldType;
(function (MUITextFieldType) {
    MUITextFieldType[MUITextFieldType["NormalType"] = 0] = "NormalType";
    MUITextFieldType[MUITextFieldType["PasswordType"] = 1] = "PasswordType";
    MUITextFieldType[MUITextFieldType["SearchType"] = 2] = "SearchType";
})(MUITextFieldType || (MUITextFieldType = {}));
var MUITextField = (function (_super) {
    __extends(MUITextField, _super);
    function MUITextField() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.placeHolder = null;
        _this._inputLayer = null;
        _this.type = MUITextFieldType.NormalType;
        _this.textChangeTarget = null;
        _this.textChangeAction = null;
        _this.enterPressTarget = null;
        _this.enterPressAction = null;
        return _this;
    }
    MUITextField.prototype.init = function () {
        _super.prototype.init.call(this);
        this._setupLayer();
    };
    MUITextField.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        this._inputLayer = MUILayerGetFirstElementWithTag(this.layer, "INPUT");
        this._setupLayer();
    };
    MUITextField.prototype._setupLayer = function () {
        if (this._inputLayer == null) {
            this._inputLayer = document.createElement("input");
            if (this.type == MUITextFieldType.SearchType) {
                this._inputLayer.style.marginLeft = "10px";
                this._inputLayer.style.marginRight = "10px";
            }
            else {
                this._inputLayer.style.marginLeft = "5px";
                this._inputLayer.style.marginRight = "5px";
            }
            this._inputLayer.style.border = "0px";
            this._inputLayer.style.backgroundColor = "transparent";
            this._inputLayer.style.width = "100%";
            this._inputLayer.style.height = "100%";
            this._inputLayer.style.color = "inherit";
            this._inputLayer.style.fontSize = "inherit";
            this._inputLayer.style.fontFamily = "inherit";
            this._inputLayer.style.outline = "none";
            this.layer.appendChild(this._inputLayer);
        }
        var placeholderKey = this.layer.getAttribute("data-placeholder");
        if (placeholderKey != null)
            this._inputLayer.setAttribute("placeholder", MIOLocalizeString(placeholderKey, placeholderKey));
    };
    MUITextField.prototype.layout = function () {
        _super.prototype.layout.call(this);
        var w = this.getWidth();
        var h = this.getHeight();
        this._inputLayer.style.marginLeft = "4px";
        this._inputLayer.style.width = (w - 8) + "px";
        this._inputLayer.style.marginTop = "4px";
        this._inputLayer.style.height = (h - 8) + "px";
    };
    MUITextField.prototype.setText = function (text) {
        this.text = text;
    };
    Object.defineProperty(MUITextField.prototype, "text", {
        get: function () {
            return this._inputLayer.value;
        },
        set: function (text) {
            this._inputLayer.value = text != null ? text : "";
        },
        enumerable: true,
        configurable: true
    });
    MUITextField.prototype.setPlaceholderText = function (text) {
        this.placeHolder = text;
        this._inputLayer.setAttribute("placeholder", text);
    };
    MUITextField.prototype.setOnChangeText = function (target, action) {
        this.textChangeTarget = target;
        this.textChangeAction = action;
        var instance = this;
        this.layer.oninput = function () {
            if (instance.enabled)
                instance.textChangeAction.call(target, instance, instance._inputLayer.value);
        };
    };
    MUITextField.prototype.setOnEnterPress = function (target, action) {
        this.enterPressTarget = target;
        this.enterPressAction = action;
        var instance = this;
        this.layer.onkeyup = function (e) {
            if (instance.enabled) {
                if (e.keyCode == 13)
                    instance.enterPressAction.call(target, instance, instance._inputLayer.value);
            }
        };
    };
    MUITextField.prototype.setTextRGBColor = function (r, g, b) {
        var value = "rgb(" + r + ", " + g + ", " + b + ")";
        this._inputLayer.style.color = value;
    };
    Object.defineProperty(MUITextField.prototype, "textColor", {
        get: function () {
            var color = this._getValueFromCSSProperty("color");
            return color;
        },
        set: function (color) {
            this._inputLayer.style.color = color;
        },
        enumerable: true,
        configurable: true
    });
    MUITextField.prototype.becameFirstResponder = function () {
        this._inputLayer.focus();
    };
    return MUITextField;
}(MUIControl));
