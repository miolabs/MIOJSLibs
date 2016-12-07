/**
 * Created by godshadow on 11/11/2016.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOViewController_PresentationController.ts" />
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
        this._canvasLayer = null;
    }
    MIOPopoverPresentationController.prototype.initWithRootViewController = function (vc) {
        _super.prototype.init.call(this);
        this._rootViewController = vc;
        this.addChildViewController(vc);
        var contentSize = vc.preferredContentSize;
        this._canvasLayer = document.createElement("CANVAS");
        this._canvasLayer.setAttribute("width", contentSize.width);
        this._canvasLayer.setAttribute("height", contentSize.height);
    };
    MIOPopoverPresentationController.prototype.viewDidLoad = function () {
        _super.prototype.viewDidLoad.call(this);
        this._drawPopOverBorder();
    };
    MIOPopoverPresentationController.prototype._drawPopOverBorder = function () {
        var context = this._canvasLayer.getContext('2d');
        var w = this.view.getWidth();
        var radius = 3;
        var color = 'rgba(170, 170, 170, 1)';
        //// Bezier Drawing
        context.beginPath();
        // Left corner
        context.moveTo(0, radius);
        context.bezierCurveTo(0, 0, w, 0, radius, 0);
        context.lineTo(w - radius, 0);
        context.closePath();
        context.strokeStyle = color;
        context.lineWidth = 1;
        context.stroke();
    };
    return MIOPopoverPresentationController;
}(MIOPresentationController));
//# sourceMappingURL=MIOViewController_PopoverPresentationController.js.map