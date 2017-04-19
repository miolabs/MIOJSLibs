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

    protected _presentedViewController:MUIViewController = null; //ToVC
    presentingViewController = null; //FromVC
    presentedView = null;

    protected _transitioningDelegate = null;
    private _window = null;

    isPresented:boolean = false;

    initWithPresentedViewControllerAndPresentingViewController(presentedViewController, presentingViewController)
    {
        super.init();

        this.presentedViewController = presentedViewController;
        this.presentingViewController = presentingViewController;        
    }

    setPresentedViewController(vc:MUIViewController)
    {
        this._presentedViewController = vc;
        this.presentedView = vc.view;
    }

    set presentedViewController(vc:MUIViewController)
    {
        this.setPresentedViewController(vc);
    }

    get presentedViewController():MUIViewController
    {
        return this._presentedViewController;
    }

    get transitioningDelegate()
    {
        if (this._transitioningDelegate == null)
        {
            this._transitioningDelegate = new MIOModalTransitioningDelegate();
            this._transitioningDelegate.init();
        }

        return this._transitioningDelegate;
    }

    presentationTransitionWillBegin()
    {
        var toVC = this.presentedViewController;
        var view = this.presentedView;

        this._calculateFrame();

        if (toVC.modalPresentationStyle == MUIModalPresentationStyle.PageSheet && MIOLibIsMobile() == false)
        {
            view.layer.style.borderLeft = "1px solid rgb(208, 208, 219)";
            view.layer.style.borderBottom = "1px solid rgb(208, 208, 219)";
            view.layer.style.borderRight = "1px solid rgb(208, 208, 219)";
        }       
    }

    _calculateFrame()
    {
        var fromVC = this.presentingViewController;
        var toVC = this.presentedViewController;
        var view = this.presentedView;

        if (toVC.modalPresentationStyle == MUIModalPresentationStyle.FullScreen)
        {
            var ws = MUIWindowSize();
            view.setFrame(MIOFrame.frameWithRect(0, 0, ws.width, ws.height));
        }
        else if (toVC.modalPresentationStyle == MUIModalPresentationStyle.CurrentContext)
        {
            var w = fromVC.view.getWidth();
            var h = fromVC.view.getHeight();

            view.setFrame(MIOFrame.frameWithRect(0, 0, w, h));
        }
        else if (toVC.modalPresentationStyle == MUIModalPresentationStyle.PageSheet && MIOLibIsMobile() == false)
        {
            // Present like desktop sheet window
            var ws = MUIWindowSize();

            var size = toVC.preferredContentSize;
            if (size == null) size = new MIOSize(320, 200);

            var w = toVC.preferredContentSize.width;
            var h = toVC.preferredContentSize.height;
            var x = (ws.width - w) / 2;

            view.setFrame(MIOFrame.frameWithRect(0, 0, w, h));
            this.window.setFrame(MIOFrame.frameWithRect(x, 0, w, h))

            view.layer.style.borderLeft = "1px solid rgb(208, 208, 219)";
            view.layer.style.borderBottom = "1px solid rgb(208, 208, 219)";
            view.layer.style.borderRight = "1px solid rgb(208, 208, 219)";
        }
        else if (toVC.modalPresentationStyle == MUIModalPresentationStyle.FormSheet)
        {
            // Present at the center of the screen
            var ws = MUIWindowSize();

            var size = toVC.preferredContentSize;
            if (size == null) size = new MIOSize(320, 200);

            var w = size.width;
            var h = size.height;
            var x = (ws.width - w) / 2;
            var y = (ws.height - h) / 2;

            view.setFrame(MIOFrame.frameWithRect(0, 0, w, h));
            this.window.setFrame(MIOFrame.frameWithRect(x, y, w, h))

            view.layer.style.borderRadius = "5px 5px 5px 5px";
            view.layer.style.border = "1px solid rgb(208, 208, 219)";
        }
        else
        {
            var w = toVC.preferredContentSize.width;
            var h = toVC.preferredContentSize.height;

            view.setFrame(MIOFrame.frameWithRect(0, 0, w, h));
        }        
    }

    presentationTransitionDidEnd(completed)
    {
        this.isPresented = true;
    }

    dismissalTransitionWillBegin()
    {

    }

    dismissalTransitionDidEnd(completed)
    {
        this.isPresented = false;
    }

    get window()
    {
        return this._window;
    }
    
    set window(window:MUIWindow)
    {
        var vc = this.presentedViewController;
        this._window = window;
        
        // Track view frame changes
        if (MIOCoreIsMobile() == false && vc.modalPresentationStyle != MUIModalPresentationStyle.CurrentContext)
        {
            vc.addObserver(this, "preferredContentSize");
        }
    }

    observeValueForKeyPath(key, type, object) {

        if (key == "preferredContentSize" && type == "did")
        {
            var vc = this.presentedView;
            //this.window.layer.style.transition = "left 0.25s, width 0.25s, height 0.25s";
            vc.layer.style.transition = "left 0.25s, width 0.25s, height 0.25s";
            this._calculateFrame();            
        }
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