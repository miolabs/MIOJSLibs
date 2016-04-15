/**
 * Created by godshadow on 12/3/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOCore.ts" />
function MIOTextFieldFromElementID(view, elementID) {
    var layer = MIOLayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;
    var tf = new MIOTextField();
    tf.initWithLayer(layer);
    view._linkViewToSubview(tf);
    return tf;
}
var MIOTextField = (function (_super) {
    __extends(MIOTextField, _super);
    function MIOTextField() {
        _super.apply(this, arguments);
        this.placeHolder = null;
        this.inputLayer = null;
        this.textChangeTarget = null;
        this.textChangeAction = null;
    }
    MIOTextField.prototype.init = function () {
        _super.prototype.init.call(this);
        this._setupLayer();
    };
    MIOTextField.prototype.initWithLayer = function (layer) {
        _super.prototype.initWithLayer.call(this, layer);
        this._setupLayer();
    };
    MIOTextField.prototype._setupLayer = function () {
        //this.layer.contentEditable = true;
        this.inputLayer = document.createElement("input");
        this.inputLayer.setAttribute("type", "text");
        this.inputLayer.style.backgroundColor = "transparent";
        this.inputLayer.style.border = "0px";
        this.inputLayer.classList.add("text_field_style");
        this.layer.appendChild(this.inputLayer);
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
        this.inputLayer.value = text == null ? "" : text;
    };
    MIOTextField.prototype.getText = function () {
        return this.inputLayer.value;
    };
    MIOTextField.prototype.setPlaceholderText = function (text) {
        this.placeHolder = text;
        this.inputLayer.setAttribute("placeholder", text);
    };
    MIOTextField.prototype.setOnChangeText = function (target, action) {
        this.textChangeTarget = target;
        this.textChangeAction = action;
        var instance = this;
        //this.layer.onkeyup = function()
        //{
        //    if (instance.enabled)
        //        instance.textChangeAction.call(target, instance, instance.inputLayer.value);
        //}
        //
        //this.layer.onfocusout = function()
        //{
        //    if (instance.enabled)
        //        instance.textChangeAction.call(target, instance, instance.inputLayer.value);
        //}
        this.layer.oninput = function () {
            if (instance.enabled)
                instance.textChangeAction.call(target, instance, instance.inputLayer.value);
        };
    };
    return MIOTextField;
})(MIOControl);
//# sourceMappingURL=MIOTextField.js.map