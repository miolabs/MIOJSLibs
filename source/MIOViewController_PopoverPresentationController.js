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
        this._contentSize = null;
        this._canvasLayer = null;
        this._contentView = null;
    }
    MIOPopoverPresentationController.prototype.init = function () {
        _super.prototype.init.call(this);
    };
    MIOPopoverPresentationController.prototype.setPresentedViewController = function (vc) {
        _super.prototype.setPresentedViewController.call(this, vc);
        var size = vc.preferredContentSize;
        this._contentSize = size;
        var w = size.width + 2;
        var h = size.height + 2;
        this.presentedView = new MIOView();
        this.presentedView.initWithFrame(MIOFrame.frameWithRect(0, 0, w, h));
        this.presentedView.addSubview(vc.view);
    };
    MIOPopoverPresentationController.prototype.presentationTransitionWillBegin = function () {
        this.presentedView.layer.style.borderRadius = "5px 5px 5px 5px";
        this.presentedView.layer.style.border = "1px solid rgb(170, 170, 170)";
        this.presentedView.layer.style.overflow = "hidden";
        this.presentedView.layer.style.zIndex = 10; // To make clip the children views
    };
    MIOPopoverPresentationController.prototype._drawRoundRect = function (x, y, width, height, radius) {
        var ctx = this._canvasLayer.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        var color = 'rgba(170, 170, 170, 1)';
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();
    };
    return MIOPopoverPresentationController;
}(MIOPresentationController));
var MIOPopOverPresentAnimationController = (function (_super) {
    __extends(MIOPopOverPresentAnimationController, _super);
    function MIOPopOverPresentAnimationController() {
        _super.apply(this, arguments);
    }
    MIOPopOverPresentAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0.15;
    };
    MIOPopOverPresentAnimationController.prototype.animateTransition = function (transitionContext) {
        // make view configurations before transitions
        var vc = transitionContext.presentedViewController;
        var view = transitionContext["presentedView"];
        var w = vc.preferredContentSize.width;
        var h = vc.preferredContentSize.height;
        var v = vc.popoverPresentationController.sourceView;
        var f = vc.popoverPresentationController.sourceRect;
        var xShift = false;
        // Below
        var y = v.layer.getBoundingClientRect().top + f.size.height + 10;
        if ((y + h) > window.innerHeight)
            y = v.layer.getBoundingClientRect().top - h - 10;
        if (y < 0) {
            xShift = true;
            y = (window.innerHeight - h) / 2;
        }
        var x = 0;
        if (xShift == false) {
            x = v.layer.getBoundingClientRect().left + 10;
            if ((x + w) > window.innerWidth)
                x = v.layer.getBoundingClientRect().left + f.size.width - w + 10;
        }
        else {
            x = v.layer.getBoundingClientRect().left + f.size.width + 10;
            if ((x + w) > window.innerWidth)
                x = v.layer.getBoundingClientRect().left - w - 10;
        }
        view.setX(x);
        view.setY(y);
    };
    MIOPopOverPresentAnimationController.prototype.animationEnded = function (transitionCompleted) {
        // make view configurations after transitions
    };
    // TODO: Not iOS like transitions. For now we use css animations
    MIOPopOverPresentAnimationController.prototype.animations = function (transitionContext) {
        var animations = MUIClassListForAnimationType(MUIAnimationType.FadeIn);
        return animations;
    };
    return MIOPopOverPresentAnimationController;
}(MIOObject));
var MIOPopOverDismissAnimationController = (function (_super) {
    __extends(MIOPopOverDismissAnimationController, _super);
    function MIOPopOverDismissAnimationController() {
        _super.apply(this, arguments);
    }
    MIOPopOverDismissAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0.15;
    };
    MIOPopOverDismissAnimationController.prototype.animateTransition = function (transitionContext) {
        // make view configurations after transitions
    };
    MIOPopOverDismissAnimationController.prototype.animationEnded = function (transitionCompleted) {
        // make view configurations before transitions
    };
    // TODO: Not iOS like transitions. For now we use css animations
    MIOPopOverDismissAnimationController.prototype.animations = function (transitionContext) {
        var animations = MUIClassListForAnimationType(MUIAnimationType.FadeOut);
        return animations;
    };
    return MIOPopOverDismissAnimationController;
}(MIOObject));
//# sourceMappingURL=MIOViewController_PopoverPresentationController.js.map