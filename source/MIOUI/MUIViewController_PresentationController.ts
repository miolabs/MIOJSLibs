/**
 * Created by godshadow on 06/12/2016.
 */

/// <reference path="MUIViewController.ts" />

enum MUIModalPresentationStyle
{
    FullScreen,
    PageSheet, // normal modal sheet in osx
    FormSheet, // normal modal like floating window but horizontal and vertically centered
    CurrentContext,
    Custom,
    OverFullScreen,     // Similar to FullScreen but the view beneath doesnpt dissappear
    OverCurrentContext, // Similuar like previus, but in current context
    Popover, // the popover, almost like FormSheet but no centered
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
    presentationStyle = MUIModalPresentationStyle.PageSheet;
    shouldPresentInFullscreen = false;

    protected _presentedViewController = null; //ToVC
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
        //this.presentedView = vc.view;

        var size = vc.preferredContentSize;

        var w = size.width + 2;
        var h = size.height + 2;

        var window = new MUIWindow();
        window.initWithFrame(MIOFrame.frameWithRect(0, 0, w, h));

        window.rootViewController = vc;
        window.addSubview(vc.view);
                
        this.presentedView = window;

        window.makeKeyAndVisible();

        if (vc.transitioningDelegate == null)
        {
            vc.transitioningDelegate = new MIOModalTransitioningDelegate();
            vc.transitioningDelegate.init();
        }        
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
        if (MIOCoreIsMobile() == false)
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

    private _presentAnimationController = null;
    private _dissmissAnimationController = null;

    animationControllerForPresentedController(presentedViewController, presentingViewController, sourceController)
    {
        if (this._presentAnimationController == null) {

            this._presentAnimationController = new MIOModalPresentAnimationController();
            this._presentAnimationController.init();
        }

        return this._presentAnimationController
    }

    animationControllerForDismissedController(dismissedController)
    {
        if (this._dissmissAnimationController == null) {

            this._dissmissAnimationController = new MIOModalDismissAnimationController();
            this._dissmissAnimationController.init();
        }

        return this._dissmissAnimationController;
    }
}

class MIOAnimationController extends MIOObject
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

        if (toVC.modalPresentationStyle == MUIModalPresentationStyle.FullScreen)
        {
            var ws = MUIWindowSize();
            toVC.view.setFrame(MIOFrame.frameWithRect(0, 0, ws.width, ws.height));
        }
        else if (toVC.modalPresentationStyle == MUIModalPresentationStyle.CurrentContext)
        {
            var w = fromVC.view.getWidth();
            var h = fromVC.view.getHeight();

            toVC.view.setFrame(MIOFrame.frameWithRect(0, 0, w, h));
        }
        else if (toVC.modalPresentationStyle == MUIModalPresentationStyle.PageSheet && MIOLibIsMobile() == false)
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
            var w = toVC.preferredContentSize.width;
            var h = toVC.preferredContentSize.height;

            toVC.view.setFrame(MIOFrame.frameWithRect(0, 0, w, h));
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

        var toVC = transitionContext.presentedViewController;

        if (toVC.modalPresentationStyle == MUIModalPresentationStyle.PageSheet 
            || toVC.modalPresentationStyle == MUIModalPresentationStyle.FormSheet)
        {
            if (MIOLibIsMobile() == true)
                animations = MUIClassListForAnimationType(MUIAnimationType.SlideInUp);
            else 
                animations = MUIClassListForAnimationType(MUIAnimationType.BeginSheet);
        }                            

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

        var fromVC = transitionContext.presentingViewController;

        if (fromVC.modalPresentationStyle == MUIModalPresentationStyle.PageSheet 
            || fromVC.modalPresentationStyle == MUIModalPresentationStyle.FormSheet)
        {
            if (MIOLibIsMobile() == true)                        
                animations = MUIClassListForAnimationType(MUIAnimationType.SlideOutDown);
            else 
                animations = MUIClassListForAnimationType(MUIAnimationType.EndSheet);
        }                            

        return animations;
    }

}