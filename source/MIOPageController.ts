/**
 * Created by godshadow on 11/3/16.
 */

/// <reference path="MIOViewController.ts" />

class MIOPageController extends MIOViewController
{
    selectedViewControllerIndex = 0;

    addPageViewController(vc)
    {
        this.addChildViewController(vc);
        if (vc.transitioningDelegate == null)
            vc.transitioningDelegate = this;
    }

    protected _loadChildControllers()
    {
        var vc = this.childViewControllers[0];
        this.view.addSubview(vc.view);
        vc.onLoadView(this, function () {

            this._setViewLoaded(true);
        });
    }

    viewWillAppear()
    {
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewWillAppear();
        vc._childControllersWillAppear();
    }

    viewDidAppear()
    {
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewDidAppear();
        vc._childControllersDidAppear();
    }

    viewWillDisappear()
    {
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewWillDisappear();
        vc._childControllersWillDisappear();
    }

    viewDidDisappear()
    {
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewDidDisappear();
        vc._childControllersDidDisappear();
    }

    showPageAtIndex(index)
    {
        if (this.selectedViewControllerIndex == -1)
            return;

        if (index == this.selectedViewControllerIndex)
            return;

        if (index < 0)
            return;

        if (index >= this.childViewControllers.length)
            return;

        var oldVC = this.childViewControllers[this.selectedViewControllerIndex];
        var newVC = this.childViewControllers[index];

        this.selectedViewControllerIndex = index;

        newVC.onLoadView(this, function () {

            this.view.addSubview(newVC.view);
            this.addChildViewController(newVC);

            _MIUShowViewController(oldVC, newVC, this, false, this, function () {

                oldVC.view.removeFromSuperview();
            });
        });
    }

    showNextPage()
    {
        this.showPageAtIndex(this.selectedViewControllerIndex + 1);
    }

    showPrevPage()
    {
        this.showPageAtIndex(this.selectedViewControllerIndex - 1);
    }

    // Transitioning delegate
    private _pageAnimationController = null;

    animationControllerForPresentedController(presentedViewController, presentingViewController, sourceController)
    {
        if (this._pageAnimationController == null) {

            this._pageAnimationController = new MIOPageAnimationController();
            this._pageAnimationController.init();
        }

        return this._pageAnimationController;
    }

    animationControllerForDismissedController(dismissedController)
    {
        if (this._pageAnimationController == null) {

            this._pageAnimationController = new MIOPageAnimationController();
            this._pageAnimationController.init();
        }

        return this._pageAnimationController;
    }
}

/*
 ANIMATIONS
 */

class MIOPageAnimationController extends MIOObject
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
