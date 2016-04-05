/**
 * Created by godshadow on 12/3/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOControl.ts" />
function MIOCheckButtonFromElementID(view, elementID) {
    var layer = MIOLayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;
    var button = new MIOCheckButton();
    button.initWithLayer(layer);
    view._linkViewToSubview(button);
    return button;
}
var MIOCheckButton = (function (_super) {
    __extends(MIOCheckButton, _super);
    function MIOCheckButton() {
        _super.call(this);
        this.on = false; //Off
    }
    MIOCheckButton.prototype.init = function () {
        _super.prototype.init.call(this);
        //		this.layer.classList.remove("step_control_button_unselected");
        this.layer.classList.add("check_button_state_off");
    };
    MIOCheckButton.prototype.initWithLayer = function (layer) {
        _super.prototype.initWithLayer.call(this, layer);
        this.layer.classList.add("check_button_state_off");
        this.setAction(this, this.toggleCheckButton);
    };
    MIOCheckButton.prototype.setOn = function (on) {
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
    MIOCheckButton.prototype.toggleCheckButton = function () {
        this.setOn(!this.on);
    };
    return MIOCheckButton;
})(MIOButton);
//# sourceMappingURL=MIOCheckButton.js.map