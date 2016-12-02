/**
 * Created by godshadow on 12/3/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOView.ts" />
/// <reference path="MIOControl.ts" />
/// <reference path="MIOString.ts" />
function MIOTextFieldFromElementID(view, elementID) {
    var layer = MIOLayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;
    var tf = new MIOTextField();
    tf.initWithLayer(layer);
    view._linkViewToSubview(tf);
    return tf;
}
var MIOTextFieldType;
(function (MIOTextFieldType) {
    MIOTextFieldType[MIOTextFieldType["NormalType"] = 0] = "NormalType";
    MIOTextFieldType[MIOTextFieldType["PasswordType"] = 1] = "PasswordType";
    MIOTextFieldType[MIOTextFieldType["SearchType"] = 2] = "SearchType";
})(MIOTextFieldType || (MIOTextFieldType = {}));
var MIOTextField = (function (_super) {
    __extends(MIOTextField, _super);
    function MIOTextField() {
        _super.apply(this, arguments);
        this.placeHolder = null;
        this._inputLayer = null;
        this.type = MIOTextFieldType.NormalType;
        this.textChangeTarget = null;
        this.textChangeAction = null;
        this.enterPressTarget = null;
        this.enterPressAction = null;
    }
    MIOTextField.prototype._customizeLayerSetup = function () {
        _super.prototype._customizeLayerSetup.call(this);
        this._inputLayer = MIOLayerGetFirstElementWithTag(this.layer, "INPUT");
        if (this._inputLayer == null) {
            this._inputLayer = document.createElement("input");
            if (this.type == MIOTextFieldType.SearchType) {
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
    MIOTextField.prototype.layout = function () {
        _super.prototype.layout.call(this);
        var w = this.getWidth();
        var h = this.getHeight();
        this._inputLayer.style.marginLeft = "4px";
        this._inputLayer.style.width = (w - 8) + "px";
        this._inputLayer.style.marginTop = "4px";
        this._inputLayer.style.height = (h - 8) + "px";
    };
    MIOTextField.prototype.setText = function (text) {
        this.text = text;
    };
    Object.defineProperty(MIOTextField.prototype, "text", {
        get: function () {
            return this._inputLayer.value;
        },
        set: function (text) {
            this._inputLayer.value = text != null ? text : "";
        },
        enumerable: true,
        configurable: true
    });
    MIOTextField.prototype.setPlaceholderText = function (text) {
        this.placeHolder = text;
        this._inputLayer.setAttribute("placeholder", text);
    };
    MIOTextField.prototype.setOnChangeText = function (target, action) {
        this.textChangeTarget = target;
        this.textChangeAction = action;
        var instance = this;
        this.layer.oninput = function () {
            if (instance.enabled)
                instance.textChangeAction.call(target, instance, instance._inputLayer.value);
        };
    };
    MIOTextField.prototype.setOnEnterPress = function (target, action) {
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
    MIOTextField.prototype.setTextRGBColor = function (r, g, b) {
        var value = "rgb(" + r + ", " + g + ", " + b + ")";
        this._inputLayer.style.color = value;
    };
    Object.defineProperty(MIOTextField.prototype, "textColor", {
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
    MIOTextField.prototype.becameFirstResponder = function () {
        this._inputLayer.focus();
    };
    return MIOTextField;
}(MIOControl));
//# sourceMappingURL=MIOTextField.js.map