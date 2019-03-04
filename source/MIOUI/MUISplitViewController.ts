import { _MIUShowViewController, _MUIHideViewController } from "./MIOUI_Core";
import { MUIView } from "./MUIView";
import { MUIViewController } from "./MUIViewController";
import { MUICoreLayerAddStyle } from ".";
import { MIOCoreIsPhone } from "../MIOCore/platform";
import { MIOObject } from "../MIOFoundation";
import { MUIAnimationType } from "../MIOUI";
import { MUIClassListForAnimationType } from "./MIOUI_CoreAnimation";
import { MUIButton } from "./MUIButton";

/**
 * Created by godshadow on 05/08/16.
 */

export enum MUISplitViewControllerDisplayMode
{
    Automatic,
    PrimaryHidden,
    AllVisible,
    PrimaryOverlay
}

export class MUISplitViewController extends MUIViewController
{
    private masterView:MUIView = null;
    private detailView:MUIView = null;

    preferredDisplayMode = MUISplitViewControllerDisplayMode.Automatic;
    
    init(){
        super.init();

        this.masterView = new MUIView();
        this.masterView.init();
        if (MIOCoreIsPhone() == false) MUICoreLayerAddStyle(this.masterView.layer, "master-view");
        this.view.addSubview(this.masterView);

        if (MIOCoreIsPhone() == false) {
            this.detailView = new MUIView();
            this.detailView.init();
            MUICoreLayerAddStyle(this.detailView.layer, "detail-view");        
            this.view.addSubview(this.detailView);
        }
    }
    
    get displayMode():MUISplitViewControllerDisplayMode{
        return MUISplitViewControllerDisplayMode.Automatic;
    }

    private _displayModeButtonItem:MUIButton = null;
    get displayModeButtonItem():MUIButton {
        if (this._displayModeButtonItem != null) return this._displayModeButtonItem;

        this._displayModeButtonItem = new MUIButton();
        this._displayModeButtonItem.initWithAction(this, this.displayModeButtonItemAction);        

        return this._displayModeButtonItem;
    }

    private _collapsed = false;
    get collapsed():boolean{
        return this._collapsed;
    }
    private setCollapsed(value:boolean){
        this.willChangeValue("collapsed");
        this._collapsed = value;
        this.didChangeValue("collapsed");
    }

    private _masterViewController = null;    
    setMasterViewController(vc){
        if (this._masterViewController != null){
            this._masterViewController.view.removeFromSuperview();
            this.removeChildViewController(this._masterViewController);
            this._masterViewController = null;
        }

        if (vc != null){
            vc.parent = this;
            vc.splitViewController = this;

            this.masterView.addSubview(vc.view);
            this.addChildViewController(vc);
            this._masterViewController = vc;
        }
    }

    private _detailViewController = null;
    setDetailViewController(vc){
        if (MIOCoreIsPhone() == true) return;

        if (this._detailViewController != null){
            this._detailViewController.view.removeFromSuperview();
            this.removeChildViewController(this._detailViewController);
            this._detailViewController = null;
        }

        if (vc != null){
            vc.parent = this;
            vc.splitViewController = this;

            this.detailView.addSubview(vc.view);
            this.addChildViewController(vc);
            this._detailViewController = vc;
        }
    }

    showDetailViewController(vc:MUIViewController){
        vc.splitViewController = this;
        if (MIOCoreIsPhone() == true) {
            this._pushDetailViewController(vc);
        }
        else {
            this._showDetailViewController(vc);
        }
    }

    get masterViewController():MUIViewController{
        return this._masterViewController;
    }

    get detailViewController():MUIViewController{
        return this._detailViewController;
    }

    private _showDetailViewController(vc:MUIViewController){
        let oldVC = this._detailViewController;
        let newVC = vc;

        if (oldVC == newVC) return;

        newVC.onLoadView(this, function () {

            this.detailView.addSubview(newVC.view);
            this.addChildViewController(newVC);
            this._detailViewController = vc;

            _MIUShowViewController(oldVC, newVC, this, false, this, function () {

                oldVC.view.removeFromSuperview();
                this.removeChildViewController(oldVC);
            });
        });
    }

    private _pushDetailViewController(vc:MUIViewController){
        let oldVC = this._masterViewController;

        //if (vc.transitioningDelegate == null) vc.transitioningDelegate = this;

        vc.onLoadView(this, function () {

            this.view.addSubview(vc.view);
            this.addChildViewController(vc);
            this._detailViewController = vc;

            if (vc.preferredContentSize != null)
                this.preferredContentSize = vc.preferredContentSize;

            _MIUShowViewController(oldVC, vc, this, true, this, function(){
                this.setCollapsed(true);
            });
        });
    }

    private _popViewController(){
        let fromVC = this.detailViewController;
        let toVC = this.masterViewController;

        // if (toVC.transitioningDelegate == null)
        //     toVC.transitioningDelegate = this;

        if (toVC.preferredContentSize != null)
            this.contentSize = toVC.preferredContentSize;

        _MUIHideViewController(fromVC, toVC, this, this, function () {
            fromVC.removeChildViewController(this);
            fromVC.view.removeFromSuperview();
        });
    }

    private displayModeButtonItemAction(){
        if (MIOCoreIsPhone() == true) this._popViewController();
    }

    // Transitioning delegate
    private _pushAnimationController = null;
    private _popAnimationController = null;

    animationControllerForPresentedController(presentedViewController, presentingViewController, sourceController){
        if (MIOCoreIsPhone() == false) return;

        if (this._pushAnimationController == null) {
            this._pushAnimationController = new MUIPushAnimationController();
            this._pushAnimationController.init();
        }

        return this._pushAnimationController;
    }

    animationControllerForDismissedController(dismissedController:MUIViewController){
        if (MIOCoreIsPhone() == false) return;

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
    transitionDuration(transitionContext){
        return 0.25;
    }

    animateTransition(transitionContext){
        // make view configurations before transitions       
    }

    animationEnded(transitionCompleted){
        // make view configurations after transitions
    }

    // TODO: Not iOS like transitions. For now we use css animations
    animations(transitionContext){
        let animations = MUIClassListForAnimationType(MUIAnimationType.Push);
        return animations;
    }

}

class MUIPopAnimationController extends MIOObject
{
    transitionDuration(transitionContext){
        return 0.25;
    }

    animateTransition(transitionContext){
        // make view configurations after transitions
    }

    animationEnded(transitionCompleted){
        // make view configurations before transitions
    }

    // TODO: Not iOS like transitions. For now we use css animations
    animations(transitionContext){
        let animations = MUIClassListForAnimationType(MUIAnimationType.Pop);
        return animations;
    }

}

