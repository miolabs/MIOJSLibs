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
        this.inputLayer = null;
        this.type = MIOTextFieldType.NormalType;
        this.textChangeTarget = null;
        this.textChangeAction = null;
        this.enterPressTarget = null;
        this.enterPressAction = null;
    }
    MIOTextField.prototype.init = function () {
        _super.prototype.init.call(this);
        this._setupLayer();
    };
    MIOTextField.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        this._setupLayer();
    };
    MIOTextField.prototype._setupLayer = function () {
        switch (this.layerOptions) {
            case "SearchType":
                this.type = MIOTextFieldType.SearchType;
                break;
            case "PasswordType":
                this.type = MIOTextFieldType.PasswordType;
                break;
            default:
                this.type = MIOTextFieldType.NormalType;
                break;
        }
        if (this.type == MIOTextFieldType.SearchType)
            this.layer.classList.add("searchfield");
        else
            this.layer.classList.add("textfield");
        this.inputLayer = document.createElement("input");
        if (this.type == MIOTextFieldType.PasswordType)
            this.inputLayer.setAttribute("type", "password");
        else
            this.inputLayer.setAttribute("type", "text");
        this.inputLayer.style.backgroundColor = "transparent";
        this.inputLayer.style.border = "0px";
        this.inputLayer.style.width = "100%";
        if (this.type == MIOTextFieldType.SearchType) {
            this.inputLayer.style.marginLeft = "10px";
            this.inputLayer.style.marginRight = "10px";
        }
        else {
            this.inputLayer.style.marginLeft = "5px";
            this.inputLayer.style.marginRight = "5px";
        }
        this.inputLayer.style.height = "100%";
        this.inputLayer.style.color = "inherit";
        this.inputLayer.style.fontSize = "inherit";
        this.inputLayer.style.fontFamily = "inherit";
        this.inputLayer.style.outline = "none";
        this.layer.appendChild(this.inputLayer);
        var placeholderKey = this.layer.getAttribute("data-placeholder-localize-key");
        if (placeholderKey != null)
            this.inputLayer.setAttribute("placeholder", MIOLocalizeString(placeholderKey, placeholderKey));
    };
    MIOTextField.prototype.layout = function () {
        _super.prototype.layout.call(this);
        var w = this.getWidth();
        var h = this.getHeight();
        this.inputLayer.style.marginLeft = "4px";
        this.inputLayer.style.width = (w - 8) + "px";
        this.inputLayer.style.marginTop = "4px";
        this.inputLayer.style.height = (h - 8) + "px";
    };
    MIOTextField.prototype.setText = function (text) {
        this.text = text;
    };
    Object.defineProperty(MIOTextField.prototype, "text", {
        get: function () {
            return this.inputLayer.value;
        },
        set: function (text) {
            this.inputLayer.value = text != null ? text : "";
        },
        enumerable: true,
        configurable: true
    });
    MIOTextField.prototype.setPlaceholderText = function (text) {
        this.placeHolder = text;
        this.inputLayer.setAttribute("placeholder", text);
    };
    MIOTextField.prototype.setOnChangeText = function (target, action) {
        this.textChangeTarget = target;
        this.textChangeAction = action;
        var instance = this;
        this.layer.oninput = function () {
            if (instance.enabled)
                instance.textChangeAction.call(target, instance, instance.inputLayer.value);
        };
    };
    MIOTextField.prototype.setOnEnterPress = function (target, action) {
        this.enterPressTarget = target;
        this.enterPressAction = action;
        var instance = this;
        this.layer.onkeyup = function (e) {
            if (instance.enabled) {
                if (e.keyCode == 13)
                    instance.enterPressAction.call(target, instance, instance.inputLayer.value);
            }
        };
    };
    return MIOTextField;
}(MIOControl));
//# sourceMappingURL=MIOTextField.js.map