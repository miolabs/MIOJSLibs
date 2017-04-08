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
/// <reference path="MUIControl.ts" />
function MIOCheckButtonFromElementID(view, elementID) {
    var layer = MUILayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;
    var button = new MUICheckButton();
    button.initWithLayer(layer);
    view._linkViewToSubview(button);
    return button;
}
var MUICheckButton = (function (_super) {
    __extends(MUICheckButton, _super);
    function MUICheckButton() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.target = null;
        _this.action = null;
        _this.on = false; //Off
        return _this;
    }
    MUICheckButton.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        this.layer.classList.add("check_button");
        this.layer.classList.add("check_button_state_off");
        var instance = this;
        this.layer.onclick = function () {
            if (instance.enabled) {
                instance.toggleValue.call(instance);
            }
        };
    };
    MUICheckButton.prototype.setOnChangeValue = function (target, action) {
        this.target = target;
        this.action = action;
    };
    MUICheckButton.prototype.setOn = function (on) {
        this.on = on;
        if (on == true) {
            this.layer.classList.remove("check_button_state_off");
            this.layer.classList.add("check_button_state_on");
        }
        else {
            this.layer.classList.remove("check_button_state_on");
            this.layer.classList.add("check_button_state_off");
        }
    };
    MUICheckButton.prototype.toggleValue = function () {
        this.setOn(!this.on);
        if (this.target != null && this.action != null)
            this.action.call(this.target, this, this.on);
    };
    return MUICheckButton;
}(MUIControl));
