/**
 * Created by godshadow on 15/3/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOControl.ts" />
var MIOTextArea = (function (_super) {
    __extends(MIOTextArea, _super);
    function MIOTextArea() {
        _super.apply(this, arguments);
        this.textareaLayer = null;
        this.textChangeTarget = null;
        this.textChangeAction = null;
    }
    MIOTextArea.prototype._customizeLayerSetup = function () {
        _super.prototype._customizeLayerSetup.call(this);
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
    Object.defineProperty(MIOTextArea.prototype, "text", {
        get: function () {
            return this.textareaLayer.value;
        },
        set: function (text) {
            this.textareaLayer.value = text;
        },
        enumerable: true,
        configurable: true
    });
    MIOTextArea.prototype.setText = function (text) {
        this.text = text;
    };
    MIOTextArea.prototype.getText = function () {
        return this.text;
    };
    MIOTextArea.prototype.setEditMode = function (value) {
        this.textareaLayer.disabled = !value;
    };
    MIOTextArea.prototype.setOnChangeText = function (target, action) {
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
    return MIOTextArea;
}(MIOControl));
//# sourceMappingURL=MIOTextArea.js.map