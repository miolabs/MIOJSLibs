/**
 * Created by godshadow on 11/11/2016.
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
/// <reference path="MUIViewController_PresentationController.ts" />
var MUIPopoverArrowDirection;
(function (MUIPopoverArrowDirection) {
    MUIPopoverArrowDirection[MUIPopoverArrowDirection["Any"] = 0] = "Any";
    MUIPopoverArrowDirection[MUIPopoverArrowDirection["Up"] = 1] = "Up";
    MUIPopoverArrowDirection[MUIPopoverArrowDirection["Down"] = 2] = "Down";
    MUIPopoverArrowDirection[MUIPopoverArrowDirection["Left"] = 3] = "Left";
    MUIPopoverArrowDirection[MUIPopoverArrowDirection["Right"] = 4] = "Right";
})(MUIPopoverArrowDirection || (MUIPopoverArrowDirection = {}));
var MUIPopoverPresentationController = (function (_super) {
    __extends(MUIPopoverPresentationController, _super);
    function MUIPopoverPresentationController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.permittedArrowDirections = MUIPopoverArrowDirection.Any;
        _this.sourceView = null;
        _this.sourceRect = MIOFrame.Zero();
        _this.delegate = null;
        _this._contentSize = null;
        _this._canvasLayer = null;
        _this._contentView = null;
        return _this;
    }
    Object.defineProperty(MUIPopoverPresentationController.prototype, "transitioningDelegate", {
        // setPresentedViewController(vc) {
        //     this._presentedViewController = vc;
        //     var size = vc.preferredContentSize;
        //     var w = size.width + 2;
        //     var h = size.height + 2;
        //     var window = new MUIWindow();
        //     window.initWithFrame(MIOFrame.frameWithRect(0, 0, w, h));
        //     window.rootViewController = vc;
        //     window.addSubview(vc.view);
        //     this.presentedView = window;
        //     if (vc.transitioningDelegate == null)
        //     {
        //         vc.transitioningDelegate = new MIOModalPopOverTransitioningDelegate();
        //         vc.transitioningDelegate.init();
        //     }
        // }
        get: function () {
            if (this._transitioningDelegate == null) {
                this._transitioningDelegate = new MIOModalPopOverTransitioningDelegate();
                this._transitioningDelegate.init();
            }
            return this._transitioningDelegate;
        },
        enumerable: true,
        configurable: true
    });
    MUIPopoverPresentationController.prototype.presentationTransitionWillBegin = function () {
        var vc = this.presentedViewController;
        var view = this.presentedView;
        this._calculateFrame();
        this.presentedView.layer.style.borderRadius = "5px 5px 5px 5px";
        this.presentedView.layer.style.border = "1px solid rgb(170, 170, 170)";
        this.presentedView.layer.style.overflow = "hidden";
        //this.presentedView.layer.style.zIndex = 10; // To make clip the children views     
    };
    MUIPopoverPresentationController.prototype._calculateFrame = function () {
        var vc = this.presentedViewController;
        var view = this.presentedView;
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
        view.setFrame(MIOFrame.frameWithRect(0, 0, w, h));
        this.window.setFrame(MIOFrame.frameWithRect(x, y, w, h));
    };
    MUIPopoverPresentationController.prototype._drawRoundRect = function (x, y, width, height, radius) {
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
    return MUIPopoverPresentationController;
}(MUIPresentationController));
var MIOModalPopOverTransitioningDelegate = (function (_super) {
    __extends(MIOModalPopOverTransitioningDelegate, _super);
    function MIOModalPopOverTransitioningDelegate() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.modalTransitionStyle = null;
        _this._showAnimationController = null;
        _this._dissmissAnimationController = null;
        return _this;
    }
    MIOModalPopOverTransitioningDelegate.prototype.animationControllerForPresentedController = function (presentedViewController, presentingViewController, sourceController) {
        if (this._showAnimationController == null) {
            this._showAnimationController = new MIOPopOverPresentAnimationController();
            this._showAnimationController.init();
        }
        return this._showAnimationController;
    };
    MIOModalPopOverTransitioningDelegate.prototype.animationControllerForDismissedController = function (dismissedController) {
        if (this._dissmissAnimationController == null) {
            this._dissmissAnimationController = new MIOPopOverDismissAnimationController();
            this._dissmissAnimationController.init();
        }
        return this._dissmissAnimationController;
    };
    return MIOModalPopOverTransitioningDelegate;
}(MIOObject));
var MIOPopOverPresentAnimationController = (function (_super) {
    __extends(MIOPopOverPresentAnimationController, _super);
    function MIOPopOverPresentAnimationController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MIOPopOverPresentAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0.25;
    };
    MIOPopOverPresentAnimationController.prototype.animateTransition = function (transitionContext) {
        // make view configurations before transitions
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
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MIOPopOverDismissAnimationController.prototype.transitionDuration = function (transitionContext) {
        return 0.25;
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
