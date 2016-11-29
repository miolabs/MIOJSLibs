/**
 * Created by godshadow on 11/11/2016.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOViewController.ts" />
var MIOPopoverArrowDirection;
(function (MIOPopoverArrowDirection) {
    MIOPopoverArrowDirection[MIOPopoverArrowDirection["Any"] = 0] = "Any";
    MIOPopoverArrowDirection[MIOPopoverArrowDirection["Up"] = 1] = "Up";
    MIOPopoverArrowDirection[MIOPopoverArrowDirection["Down"] = 2] = "Down";
    MIOPopoverArrowDirection[MIOPopoverArrowDirection["Left"] = 3] = "Left";
    MIOPopoverArrowDirection[MIOPopoverArrowDirection["Right"] = 4] = "Right";
})(MIOPopoverArrowDirection || (MIOPopoverArrowDirection = {}));
var MIOPopoverPresentationController = (function (_super) {
    __extends(MIOPopoverPresentationController, _super);
    function MIOPopoverPresentationController() {
        _super.apply(this, arguments);
        this.permittedArrowDirections = MIOPopoverArrowDirection.Any;
        this.sourceView = null;
        this.sourceRect = MIOFrame.Zero();
        this.delegate = null;
        this._rootViewController = null;
    }
    MIOPopoverPresentationController.prototype.initWithRootViewController = function (vc) {
        _super.prototype.init.call(this);
        this._rootViewController = vc;
        this.addChildViewController(vc);
    };
    return MIOPopoverPresentationController;
}(MIOViewController));
