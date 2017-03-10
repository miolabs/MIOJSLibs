/**
 * Created by godshadow on 9/4/16.
 */

/// <reference path="MUIViewController.ts" />


class MUINavigationController extends MUIViewController
{
    rootViewController = null;
    viewControllersStack = [];
    currentViewControllerIndex = -1;

    init()
    {
        super.init();
        this.view.layer.style.overflow = "hidden";
    }

    initWithRootViewController(vc)
    {
        this.init();
        this.setRootViewController(vc);
    }

    setRootViewController(vc)
    {
        this.rootViewController = vc;
        this.view.addSubview(vc.view);

        this.viewControllersStack.push(vc);
        this.currentViewControllerIndex = 0;

        this.rootViewController.navigationController = this;

        this.addChildViewController(vc);
        if (this.presentationController != null) {
            var size = vc.preferredContentSize;
            this.contentSize = size;
        }
    }

    _childControllersWillAppear()
    {
        if (this.currentViewControllerIndex < 0)
            return;

        var vc = this.viewControllersStack[this.currentViewControllerIndex];

        vc.viewWillAppear();
        vc._childControllersWillAppear();
    }

    _childControllersDidAppear()
    {
        if (this.currentViewControllerIndex < 0)
            return;

        var vc = this.viewControllersStack[this.currentViewControllerIndex];

        vc.viewDidAppear();
        vc._childControllersDidAppear();
    }

    _childControllersWillDisappear()
    {
        if (this.currentViewControllerIndex < 0)
            return;

        var vc = this.viewControllersStack[this.currentViewControllerIndex];

        vc.viewWillDisappear();
        vc._childControllersWillDisappear();
    }

    _childControllersDidDisappear()
    {
        if (this.currentViewControllerIndex < 0)
            return;

        var vc = this.viewControllersStack[this.currentViewControllerIndex];

        vc.viewDidDisappear();
        vc._childControllersDidDisappear();
    }

    pushViewController(vc, animate?)
    {
        var lastVC = this.viewControllersStack[this.currentViewControllerIndex];

        this.viewControllersStack.push(vc);
        this.currentViewControllerIndex++;

        vc.navigationController = this;
        if (vc.transitioningDelegate == null)
            vc.transitioningDelegate = this;

        vc.onLoadView(this, function () {

            this.view.addSubview(vc.view);
            this.addChildViewController(vc);

            if (vc.preferredContentSize != null)
                this.preferredContentSize = vc.preferredContentSize;

            _MIUShowViewController(lastVC, vc, this, false);
        });
    }

    popViewController(animate?)
    {
        if (this.currentViewControllerIndex == 0)
            return;

        var fromVC = this.viewControllersStack[this.currentViewControllerIndex];

        this.currentViewControllerIndex--;
        this.viewControllersStack.pop();

        var toVC = this.viewControllersStack[this.currentViewControllerIndex];

        if (toVC.transitioningDelegate == null)
            toVC.transitioningDelegate = this;

        if (toVC.preferredContentSize != null)
            this.contentSize = toVC.preferredContentSize;

        _MUIHideViewController(fromVC, toVC, this, this, function () {

            fromVC.removeChildViewController(this);
            fromVC.view.removeFromSuperview();
        });
    }

    popToRootViewController(animate?)
    {
        if(this.viewControllersStack.length == 1) return;
        
        var currentVC = this.viewControllersStack.pop();

        for(var index = this.currentViewControllerIndex - 1; index > 0; index--)
        {
            var vc = this.viewControllersStack.pop();
            vc.view.removeFromSuperview();
            this.removeChildViewController(vc);
        }

        this.currentViewControllerIndex = 0;
        var rootVC = this.viewControllersStack[0];

        this.contentSize = rootVC.preferredContentSize;

        _MUIHideViewController(currentVC, rootVC, this, this, function () {

            currentVC.view.removeFromSuperview();
            this.removeChildViewController(currentVC);

        });
    }

    // get contentSize()
    // {
    //     if (this.currentViewControllerIndex < 0)
    //         return new MIOSize(320, 200);
    //
    //     var vc = this.viewControllersStack[this.currentViewControllerIndex];
    //
    //     return vc.contentSize;
    // }

    public get preferredContentSize()
    {
        if (this.currentViewControllerIndex < 0)
            return this._preferredContentSize;

        var vc = this.viewControllersStack[this.currentViewControllerIndex];

        return vc.preferredContentSize;
    }

    // public set contentSize(size)
    // {
    //     super.setContentSize(size);

    //     if (MIOLibIsMobile() == false)
    //     {
    //         // Calculate new frame
    //         var ws = MUIWindowSize();

    //         var w = size.width;
    //         var h = size.height;
    //         var x = (ws.width - w) / 2;

    //         var frame = MIOFrame.frameWithRect(x, 0, w, h);

    //         this.view.layer.style.transition = "left 0.25s, width 0.25s, height 0.25s";
    //         this.view.setFrame(frame);
    //     }
    // }

    // Transitioning delegate
    private _pushAnimationController = null;
    private _popAnimationController = null;

    animationControllerForPresentedController(presentedViewController, presentingViewController, sourceController)
    {
        if (this._pushAnimationController == null) {

            this._pushAnimationController = new MUIPushAnimationController();
            this._pushAnimationController.init();
        }

        return this._pushAnimationController;
    }

    animationControllerForDismissedController(dismissedController)
    {
        if (this._popAnimationController == null) {

            this._popAnimationController = new MUIPopAnimationController();
            this._popAnimationController.init();
        }

        return this._popAnimationController;
    }
}

/*
    ANIMATIONS
 */

class MUIPushAnimationController extends MIOObject
{
    transitionDuration(transitionContext)
    {
        return 0.25;
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
        var animations = MUIClassListForAnimationType(MUIAnimationType.Push);
        return animations;
    }

}

class MUIPopAnimationController extends MIOObject
{
    transitionDuration(transitionContext)
    {
        return 0.25;
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
        var animations = MUIClassListForAnimationType(MUIAnimationType.Pop);
        return animations;
    }

}