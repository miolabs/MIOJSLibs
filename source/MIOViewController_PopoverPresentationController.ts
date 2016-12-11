/**
 * Created by godshadow on 11/11/2016.
 */

/// <reference path="MIOViewController_PresentationController.ts" />

enum MIOPopoverArrowDirection
{
    Any,
    Up,
    Down,
    Left,
    Right
}

class MIOPopoverPresentationController extends MIOPresentationController {
    permittedArrowDirections = MIOPopoverArrowDirection.Any;

    sourceView = null;
    sourceRect = MIOFrame.Zero();

    delegate = null;

    private _contentSize = null;
    private _canvasLayer = null;
    private _contentView = null;

    init() {
        super.init();
    }

    setPresentedViewController(vc) {

        super.setPresentedViewController(vc);

        var size = vc.preferredContentSize;
        this._contentSize = size;

        var w = size.width + 2;
        var h = size.height + 2;

        this.presentedView = new MIOView();
        this.presentedView.initWithFrame(MIOFrame.frameWithRect(0, 0, w, h));
        this.presentedView.layer.style.borderRadius = "5px 5px 5px 5px";
        this.presentedView.layer.style.border = "1px solid rgb(170, 170, 170)";
        this.presentedView.layer.style.overflow = "hidden";
        this.presentedView.layer.style.zIndex = 10; // To make clip the children views
        this.presentedView.addSubview(vc.view);

        //this.presentedView.addSubview(vc.view);

        // this._canvasLayer = document.createElement("CANVAS");
        // this._canvasLayer.setAttribute("width", w);
        // this._canvasLayer.setAttribute("height", h);
        //
        // this._drawRoundRect(0, 0, w, h, 12);

        // this._contentView = new MIOView();
        // this._contentView.initWithLayer(this._canvasLayer);
        // this.presentedView.addSubview(this._contentView);
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

class MIOPopOverPresentAnimationController extends MIOObject
{
    transitionDuration(transitionContext)
    {
        return 0.15;
    }

    animateTransition(transitionContext)
    {
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
        if ((y + h) > window.innerHeight) // Below no, Up?
            y = v.layer.getBoundingClientRect().top - f.size.height - 10;
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

        view.setX(x);
        view.setY(y);
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