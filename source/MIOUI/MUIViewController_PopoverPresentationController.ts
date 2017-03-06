/**
 * Created by godshadow on 11/11/2016.
 */

/// <reference path="MUIViewController_PresentationController.ts" />

enum MUIPopoverArrowDirection
{
    Any,
    Up,
    Down,
    Left,
    Right
}

class MUIPopoverPresentationController extends MUIPresentationController
{
    permittedArrowDirections = MUIPopoverArrowDirection.Any;

    sourceView = null;
    sourceRect = MIOFrame.Zero();

    delegate = null;

    private _contentSize = null;
    private _canvasLayer = null;
    private _contentView = null;

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

    get transitioningDelegate()
    {
        if (this._transitioningDelegate == null)
        {
            this._transitioningDelegate = new MIOModalPopOverTransitioningDelegate();
            this._transitioningDelegate.init();
        }

        return this._transitioningDelegate;
    }

    presentationTransitionWillBegin()
    {
        var vc = this.presentedViewController;
        var view:MUIView = this.presentedView;
        
        this._calculateFrame();

        this.presentedView.layer.style.borderRadius = "5px 5px 5px 5px";
        this.presentedView.layer.style.border = "1px solid rgb(170, 170, 170)";
        this.presentedView.layer.style.overflow = "hidden";
        this.presentedView.layer.style.zIndex = 10; // To make clip the children views                
    }

    private _calculateFrame()
    {
        var vc = this.presentedViewController;
        var view:MUIView = this.presentedView;

        var w = vc.preferredContentSize.width;
        var h = vc.preferredContentSize.height;
        var v = vc.popoverPresentationController.sourceView;
        var f = vc.popoverPresentationController.sourceRect;

        var xShift = false;

        // Below
        var y = v.layer.getBoundingClientRect().top + f.size.height + 10;
        if ((y + h) > window.innerHeight) // Below no, Up?
            y = v.layer.getBoundingClientRect().top - h - 10;
        if (y < 0) // Up no, horizonal shift
        {
            xShift = true;
            y = (window.innerHeight - h) / 2;
        }

        var x = 0;

        if (xShift == false)
        {
            x = v.layer.getBoundingClientRect().left + 10;
            if ((x + w) > window.innerWidth)
                x = v.layer.getBoundingClientRect().left +f.size.width - w + 10;
        }
        else
        {
            x = v.layer.getBoundingClientRect().left + f.size.width + 10;
            if ((x + w) > window.innerWidth)
                x = v.layer.getBoundingClientRect().left - w - 10;
        }

        view.setFrame(MIOFrame.frameWithRect(0, 0, w, h));
        this.window.setFrame(MIOFrame.frameWithRect(x, y, w, h))
    }

    private _drawRoundRect(x, y, width, height, radius) {

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
    }

}

class MIOModalPopOverTransitioningDelegate extends MIOObject
{
    modalTransitionStyle = null;

    private _showAnimationController = null;
    private _dissmissAnimationController = null;

    animationControllerForPresentedController(presentedViewController, presentingViewController, sourceController)
    {
        if (this._showAnimationController == null) {

            this._showAnimationController = new MIOPopOverPresentAnimationController();
            this._showAnimationController.init();
        }

        return this._showAnimationController;
    }

    animationControllerForDismissedController(dismissedController)
    {
        if (this._dissmissAnimationController == null) {

            this._dissmissAnimationController = new MIOPopOverDismissAnimationController();
            this._dissmissAnimationController.init();
        }

        return this._dissmissAnimationController;
    }
}

class MIOPopOverPresentAnimationController extends MIOObject
{
    transitionDuration(transitionContext)
    {
        return 0.15;
    }

    animateTransition(transitionContext)
    {
        // make view configurations before transitions
    }

    animationEnded(transitionCompleted)
    {
        // make view configurations after transitions
    }

    // TODO: Not iOS like transitions. For now we use css animations
    animations(transitionContext)
    {
        var animations = MUIClassListForAnimationType(MUIAnimationType.FadeIn);
        return animations;
    }

}

class MIOPopOverDismissAnimationController extends MIOObject
{
    transitionDuration(transitionContext)
    {
        return 0.15;
    }

    animateTransition(transitionContext)
    {
        // make view configurations after transitions
    }

    animationEnded(transitionCompleted)
    {
        // make view configurations before transitions
    }

    // TODO: Not iOS like transitions. For now we use css animations
    animations(transitionContext)
    {
        var animations = MUIClassListForAnimationType(MUIAnimationType.FadeOut);
        return animations;
    }

}