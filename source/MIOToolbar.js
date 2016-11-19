/**
 * Created by godshadow on 22/5/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOButton.ts" />
var MIOToolbarButton = (function (_super) {
    __extends(MIOToolbarButton, _super);
    function MIOToolbarButton() {
        _super.apply(this, arguments);
    }
    MIOToolbarButton.buttonWithLayer = function (layer) {
        var tb = new MIOToolbarButton();
        tb.initWithLayer(layer);
        return tb;
    };
    return MIOToolbarButton;
}(MIOButton));
var MIOToolbar = (function (_super) {
    __extends(MIOToolbar, _super);
    function MIOToolbar() {
        _super.apply(this, arguments);
        this.buttons = [];
    }
    MIOToolbar.prototype._customizeLayerSetup = function () {
        _super.prototype._customizeLayerSetup.call(this);
        // Check if we have sub nodes
        if (this.layer.childNodes.length > 0) {
            for (var index = 0; index < this.layer.childNodes.length; index++) {
                var layer = this.layer.childNodes[index];
                if (layer.tagName == "DIV") {
                    var button = MIOToolbarButton.buttonWithLayer(layer);
                    button.parent = this;
                    this._linkViewToSubview(button);
                    this.addToolbarButton(button);
                }
            }
        }
    };
    MIOToolbar.prototype.addToolbarButton = function (button) {
        this.buttons.push(button);
    };
    return MIOToolbar;
}(MIOView));
//# sourceMappingURL=MIOToolbar.js.map