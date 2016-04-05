/**
 * Created by godshadow on 12/3/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOControl.ts" />
function MIOButtonFromElementID(view, elementID) {
    var layer = MIOLayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;
    var button = new MIOButton();
    button.initWithLayer(layer);
    view._linkViewToSubview(button);
    return button;
}
var MIOButton = (function (_super) {
    __extends(MIOButton, _super);
    function MIOButton() {
        _super.call(this);
        this.target = null;
        this.action = null;
    }
    MIOButton.prototype.initWithAction = function (target, action) {
        _super.prototype.init.call(this);
        this.setAction(target, action);
    };
    MIOButton.prototype.setAction = function (target, action) {
        this.target = target;
        this.action = action;
        var instance = this;
        this.layer.onclick = function () {
            if (instance.enabled)
                instance.action.call(target);
        };
    };
    MIOButton.prototype.setTitle = function (title) {
        this.layer.innerHTML = title;
    };
    return MIOButton;
})(MIOControl);
//# sourceMappingURL=MIOButton.js.map