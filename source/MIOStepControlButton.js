/**
 * Created by godshadow on 12/3/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOButton.ts" />
var MIOStepControlButton = (function (_super) {
    __extends(MIOStepControlButton, _super);
    function MIOStepControlButton() {
        _super.apply(this, arguments);
        this.percentage = 0;
        this.width = 0;
        this.title = null;
        this.index = 0;
        this.selectedButtonIndex = -1;
    }
    MIOStepControlButton.prototype.initWithTitle = function (percentage, title, index) {
        _super.prototype.init.call(this);
        this.percentage = percentage;
        this.title = title;
        this.index = index;
        this.layer.setAttribute("id", "step_control_button");
        this.layer.style.position = "absolute";
        var button_index = document.createElement("div");
        button_index.setAttribute("id", "step_control_button_index");
        button_index.innerHTML = index;
        button_index.classList.add("step_control_button_unselected");
        this.layer.appendChild(button_index);
        var button_title = document.createElement("div");
        button_title.setAttribute("id", "step_control_button_title");
        button_title.innerHTML = title;
        button_title.classList.add("step_control_button_unselected");
        this.layer.appendChild(button_title);
    };
    return MIOStepControlButton;
}(MIOButton));
/*
 Separator class
 */
var MIOStepControlSeparator = (function (_super) {
    __extends(MIOStepControlSeparator, _super);
    function MIOStepControlSeparator() {
        _super.call(this);
    }
    MIOStepControlSeparator.prototype.init = function () {
        _super.prototype.init.call(this);
        this.layer.setAttribute("id", "step_control_button_separator");
    };
    return MIOStepControlSeparator;
}(MIOView));
//# sourceMappingURL=MIOStepControlButton.js.map