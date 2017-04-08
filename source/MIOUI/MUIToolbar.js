/**
 * Created by godshadow on 22/5/16.
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
/// <reference path="MUIButton.ts" />
var MUIToolbarButton = (function (_super) {
    __extends(MUIToolbarButton, _super);
    function MUIToolbarButton() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MUIToolbarButton.buttonWithLayer = function (layer) {
        var tb = new MUIToolbarButton();
        tb.initWithLayer(layer);
        return tb;
    };
    return MUIToolbarButton;
}(MUIButton));
var MUIToolbar = (function (_super) {
    __extends(MUIToolbar, _super);
    function MUIToolbar() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.buttons = [];
        return _this;
    }
    MUIToolbar.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        // Check if we have sub nodes
        if (this.layer.childNodes.length > 0) {
            for (var index = 0; index < this.layer.childNodes.length; index++) {
                var layer = this.layer.childNodes[index];
                if (layer.tagName == "DIV") {
                    var button = MUIToolbarButton.buttonWithLayer(layer);
                    button.parent = this;
                    this._linkViewToSubview(button);
                    this.addToolbarButton(button);
                }
            }
        }
    };
    MUIToolbar.prototype.addToolbarButton = function (button) {
        this.buttons.push(button);
    };
    return MUIToolbar;
}(MUIView));
