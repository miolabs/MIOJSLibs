import { MIOObject, MIORect, MIOSize } from "../MIOFoundation";
import { MUIViewController } from "./MUIViewController";
import { MIOCoreIsPhone, MIOCoreIsMobile } from "../MIOCorePlatform";
import { MUIWindowSize } from "./MIOUI_Core";
import { MUIWindow } from "./MUIWindow";
import { MUIClassListForAnimationType, MUIAnimationType } from "./MIOUI_CoreAnimation";

/**
 * Created by godshadow on 06/12/2016.
 */

export enum MUIModalPresentationStyle
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

export enum MUIModalTransitionStyle
{
    CoverVertical,
    FlipHorizontal,
    CrossDisolve
}

export class MUIPresentationController extends MIOObject
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

        if (toVC.modalPresentationStyle == MUIModalPresentationStyle.PageSheet || MIOCoreIsPhone() == true)
        {
            view.layer.classList.add("modal_window");
        }       
    }

    _calculateFrame()
    {
        var fromVC = this.presentingViewController;
        var toVC = this.presentedViewController;
        var view = this.presentedView;

        if (toVC.modalPresentationStyle == MUIModalPresentationStyle.FullScreen || MIOCoreIsPhone() == true)
        {
            //let ws = MUIWindowSize();
            //view.setFrame(MIOFrame.frameWithRect(0, 0, ws.width, ws.height));
            view.layer.style.left = "0px";
            view.layer.style.top = "0px";
            view.layer.style.width = "100%";
            view.layer.style.height = "100%";
        }
        else if (toVC.modalPresentationStyle == MUIModalPresentationStyle.CurrentContext)
        {
            let w = fromVC.view.getWidth();
            let h = fromVC.view.getHeight();

            view.setFrame(MIORect.rectWithValues(0, 0, w, h));
        }
        else if (toVC.modalPresentationStyle == MUIModalPresentationStyle.PageSheet && MIOCoreIsPhone() == false)
        {
            // Present like desktop sheet window
            let ws = MUIWindowSize();

            let size = toVC.preferredContentSize;
            if (size == null) size = new MIOSize(320, 200);

            let w = toVC.preferredContentSize.width;
            let h = toVC.preferredContentSize.height;
            let x = (ws.width - w) / 2;

            view.setFrame(MIORect.rectWithValues(0, 0, w, h));
            this.window.setFrame(MIORect.rectWithValues(x, 0, w, h))

            view.layer.classList.add("modal_background");
        }
        else if (toVC.modalPresentationStyle == MUIModalPresentationStyle.FormSheet)
        {
            // Present at the center of the screen
            let ws = MUIWindowSize();

            let size = toVC.preferredContentSize;
            if (size == null) size = new MIOSize(320, 200);

            let w = size.width;
            let h = size.height;
            let x = (ws.width - w) / 2;
            let y = (ws.height - h) / 2;

            view.setFrame(MIORect.rectWithValues(0, 0, w, h));
            this.window.setFrame(MIORect.rectWithValues(x, y, w, h))

            view.layer.classList.add("modal_background");
        }
        else
        {
            let w = toVC.preferredContentSize.width;
            let h = toVC.preferredContentSize.height;

            view.setFrame(MIORect.rectWithValues(0, 0, w, h));
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

export class MIOModalTransitioningDelegate extends MIOObject
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

export class MIOAnimationController extends MIOObject
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

export class MIOModalPresentAnimationController extends MIOObject
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
            if (MIOCoreIsPhone() == true)
                animations = MUIClassListForAnimationType(MUIAnimationType.SlideInUp);
            else 
                animations = MUIClassListForAnimationType(MUIAnimationType.BeginSheet);
        }                            

        return animations;
    }
}

export class MIOModalDismissAnimationController extends MIOObject
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
            if (MIOCoreIsPhone() == true)                        
                animations = MUIClassListForAnimationType(MUIAnimationType.SlideOutDown);
            else 
                animations = MUIClassListForAnimationType(MUIAnimationType.EndSheet);
        }                            

        return animations;
    }

}