import { MUIViewController } from "./MUIViewController";
import { MIOObject } from "../MIOFoundation";
import { _MIUShowViewController } from "./MIOUI_Core";

/**
 * Created by godshadow on 11/3/16.
 */


export class MUIPageController extends MUIViewController
{
    selectedViewControllerIndex = 0;
    pageControllersCount = 0;

    addPageViewController(vc){
        this.addChildViewController(vc);
        if (vc.transitioningDelegate == null)
            vc.transitioningDelegate = this;
        this.pageControllersCount++;
    }

    protected _loadChildControllers(){
        if (this.childViewControllers.length == 0){
            this._setViewLoaded(true);
        }
        else {
            let vc = this.childViewControllers[0];
            this.view.addSubview(vc.view);
            vc.onLoadView(this, function () {

                this._setViewLoaded(true);
            });
        }
    }

    viewWillAppear(animated?){
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewWillAppear(animated);
        //vc._childControllersWillAppear();
    }

    viewDidAppear(animated?){
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewDidAppear(animated);
        //vc._childControllersDidAppear();
    }

    viewWillDisappear(animated?){
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewWillDisappear(animated);
        //vc._childControllersWillDisappear();
    }

    viewDidDisappear(animated?){
        var vc = this.childViewControllers[this.selectedViewControllerIndex];
        vc.viewDidDisappear(animated);
        //vc._childControllersDidDisappear();
    }

    showPageAtIndex(index){
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

    showNextPage(){
        this.showPageAtIndex(this.selectedViewControllerIndex + 1);
    }

    showPrevPage(){
        this.showPageAtIndex(this.selectedViewControllerIndex - 1);
    }

    // Transitioning delegate
    private _pageAnimationController = null;

    animationControllerForPresentedController(presentedViewController, presentingViewController, sourceController){
        if (this._pageAnimationController == null) {

            this._pageAnimationController = new MIOPageAnimationController();
            this._pageAnimationController.init();
        }

        return this._pageAnimationController;
    }

    animationControllerForDismissedController(dismissedController){
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

export class MIOPageAnimationController extends MIOObject
{
    transitionDuration(transitionContext){
        return 0;
    }

    animateTransition(transitionContext){
        // make view configurations before transitions
    }

    animationEnded(transitionCompleted){
        // make view configurations after transitions
    }

    // TODO: Not iOS like transitions. For now we use css animations
    animations(transitionContext){
        return null;
    }

}
