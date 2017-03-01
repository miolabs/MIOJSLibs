/**
 * Created by godshadow on 06/12/2016.
 */

/// <reference path="MUIViewController.ts" />

enum MUIModalPresentationStyle
{
    CurrentContext,
    FullScreen,
    PageSheet,
    FormSheet,
    Popover,
    None
}

enum MUIModalTransitionStyle
{
    CoverVertical,
    FlipHorizontal,
    CrossDisolve
}

class MUIPresentationController extends MIOObject
{
    presentationStyle = MUIModalPresentationStyle.CurrentContext;
    shouldPresentInFullscreen = true;

    private _presentedViewController = null; //ToVC
    presentingViewController = null; //FromVC
    presentedView = null;

    initWithPresentedViewControllerAndPresentingViewController(presentedViewController, presentingViewController)
    {
        super.init();

        this.presentedViewController = presentedViewController;
        this.presentingViewController = presentingViewController;
    }

    setPresentedViewController(vc)
    {
        this._presentedViewController = vc;
        this.presentedView = vc.view;
    }

    set presentedViewController(vc)
    {
        this.setPresentedViewController(vc);
    }

    get presentedViewController()
    {
        return this._presentedViewController;
    }

    presentationTransitionWillBegin()
    {
        if (MIOLibIsMobile() == false)
        {
            this.presentedView.layer.style.borderLeft = "1px solid rgb(170, 170, 170)";
            this.presentedView.layer.style.borderBottom = "1px solid rgb(170, 170, 170)";
            this.presentedView.layer.style.borderRight = "1px solid rgb(170, 170, 170)";
            //this.presentedView.layer.style.zIndex = 10; // To make clip the children views
        }
    }

    presentationTransitionDidEnd(completed)
    {
    }

    dismissalTransitionWillBegin()
    {
    }

    dismissalTransitionDidEnd(completed)
    {
    }
}

class MIOModalTransitioningDelegate extends MIOObject
{
    modalTransitionStyle = null;

    animationControllerForPresentedController(presentedViewController, presentingViewController, sourceController)
    {

    }

    animationControllerForDismissedController(dismissedController)
    {

    }
}

class MIOPresentAnimationController extends MIOObject
{
    transitionDuration(transitionContext)
    {
        return 0;
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
        return null;
    }

}

class MIOModalPresentAnimationController extends MIOObject
{
    transitionDuration(transitionContext)
    {
        return 0.15;
    }

    animateTransition(transitionContext)
    {
        // make view configurations before transitions
        var fromVC = transitionContext.presentingViewController;
        var toVC = transitionContext.presentedViewController;

        if (toVC.modalPresentationStyle == MUIModalPresentationStyle.CurrentContext)
        {
            if (MIOLibIsMobile() == false)
            {
                // Present like desktop sheet window
                var ws = MUIWindowSize();

                var w = toVC.preferredContentSize.width;
                var h = toVC.preferredContentSize.height;
                var x = (ws.width - w) / 2;

                toVC.view.setFrame(MIOFrame.frameWithRect(x, 0, w, h));
            }
            else
            {
                var w = fromVC.view.getWidth();
                var h = fromVC.view.getHeight();

                toVC.view.setFrame(MIOFrame.frameWithRect(0, 0, w, h));
            }

        }
    }

    animationEnded(transitionCompleted)
    {
        // make view configurations after transitions
    }

    // TODO: Not iOS like transitions. For now we use css animations
    animations(transitionContext)
    {
        var animations = null;

        if (MIOLibIsMobile() == true)
            animations = MUIClassListForAnimationType(MUIAnimationType.SlideInUp);
        else
            animations = MUIClassListForAnimationType(MUIAnimationType.BeginSheet);

        return animations;
    }

}

class MIOModalDismissAnimationController extends MIOObject
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
        var animations = null;
        if (MIOLibIsMobile() == true)
            animations = MUIClassListForAnimationType(MUIAnimationType.SlideOutDown);
        else
            animations = MUIClassListForAnimationType(MUIAnimationType.EndSheet);

        return animations;
    }

}