/**
 * Created by godshadow on 15/3/16.
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
/// <reference path="MUIControl.ts" />
var MUITextArea = (function (_super) {
    __extends(MUITextArea, _super);
    function MUITextArea() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.textareaLayer = null;
        _this.textChangeTarget = null;
        _this.textChangeAction = null;
        return _this;
    }
    MUITextArea.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        this.textareaLayer = document.createElement("textarea");
        this.textareaLayer.style.width = "98%";
        this.textareaLayer.style.height = "90%";
        //this.textareaLayer.backgroundColor = "transparent";
        this.textareaLayer.style.resize = "none";
        this.textareaLayer.style.borderStyle = "none";
        this.textareaLayer.style.borderColor = "transparent";
        this.textareaLayer.style.outline = "none";
        this.textareaLayer.overflow = "auto";
        this.layer.appendChild(this.textareaLayer);
    };
    Object.defineProperty(MUITextArea.prototype, "text", {
        get: function () {
            return this.textareaLayer.value;
        },
        set: function (text) {
            this.textareaLayer.value = text;
        },
        enumerable: true,
        configurable: true
    });
    MUITextArea.prototype.setText = function (text) {
        this.text = text;
    };
    MUITextArea.prototype.getText = function () {
        return this.text;
    };
    MUITextArea.prototype.setEditMode = function (value) {
        this.textareaLayer.disabled = !value;
    };
    MUITextArea.prototype.setOnChangeText = function (target, action) {
        this.textChangeTarget = target;
        this.textChangeAction = action;
        var instance = this;
        this.layer.oninput = function () {
            if (instance.enabled) {
                var value = instance.textareaLayer.value;
                instance.textChangeAction.call(target, instance, value);
            }
        };
    };
    return MUITextArea;
}(MUIControl));
