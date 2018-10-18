import { MUIView, MUILayerSearchElementByID } from "./MUIView";
import { MUIViewController } from "./MUIViewController";
import { MIOClassFromString, MIOCoreIsPhone } from "../MIOCore/platform";
import { MUIModalPresentationStyle, MUIPresentationController } from "./MUIViewController_PresentationController";
import { _MUIAnimationStart } from "./MIOUI_CoreAnimation";
import { MIOSize } from "../MIOFoundation";

export interface Window {
    prototype;
}

export function MUIOutletRegister(owner, layerID, c)
{
    owner._outlets[layerID] = c;
}

export function MUIOutletQuery(owner, layerID)
{
    return owner._outlets[layerID];
}

export function MUIOutlet(owner, elementID, className?, options?)
{
    //var layer = document.getElementById(elementID);
    let query = MUIOutletQuery(owner, elementID);
    if (query != null) return query;

    let layer = null;

    if (owner instanceof MUIView)
        layer = MUILayerSearchElementByID(owner.layer, elementID);
    else if (owner instanceof MUIViewController)
        layer = MUILayerSearchElementByID(owner.view.layer, elementID);

    if (layer == null) return null; // Element not found
        //throw new Error(`DIV identifier specified is not valid (${elementID})`);
        
    if (className == null)
        className = layer.getAttribute("data-class");

    if (className == null)
        className = "MUIView";

    let classInstance = MIOClassFromString(className);
    classInstance.initWithLayer(layer, owner, options);
    // Track outlets inside view controller (owner)
    MUIOutletRegister(owner, elementID, classInstance);

    if (owner instanceof MUIView)
        owner._linkViewToSubview(classInstance);
    else if (owner instanceof MUIViewController){

        if (classInstance instanceof MUIView){
            owner.view._linkViewToSubview(classInstance);
        }
        else if (classInstance instanceof MUIViewController)
            owner.addChildViewController(classInstance);
        else throw new Error("MUIOutlet: Wrong type");        
    }

    if (classInstance instanceof MUIView)
        classInstance.awakeFromHTML();

    return classInstance;
}

export function MUIWindowSize()
{
    var w = document.body.clientWidth;
    //var h = document.body.clientHeight;window.innerHeight
    var h = window.innerHeight;

    return new MIOSize(w, h);
}

export function _MIUShowViewController(fromVC, toVC, sourceVC, target?, completion?)
{
    toVC.viewWillAppear();
    //toVC._childControllersWillAppear();

    if (toVC.modalPresentationStyle == MUIModalPresentationStyle.FullScreen
        || toVC.modalPresentationStyle == MUIModalPresentationStyle.CurrentContext) {

        fromVC.viewWillDisappear();
        //fromVC._childControllersWillDisappear();
    }

    var view = null;
    var pc:MUIPresentationController = null;

    if (toVC.modalPresentationStyle == MUIModalPresentationStyle.FullScreen
        || toVC.modalPresentationStyle == MUIModalPresentationStyle.PageSheet
        || toVC.modalPresentationStyle == MUIModalPresentationStyle.FormSheet
        || toVC.modalPresentationStyle == MUIModalPresentationStyle.Custom
        || toVC.modalPresentationStyle == MUIModalPresentationStyle.Popover) {
        
        pc = toVC.presentationController;
        view = pc.presentedView;
    }
    else
        view = toVC.view;

    var animationContext = {};
    animationContext["presentingViewController"] = fromVC;
    animationContext["presentedViewController"] = toVC;
    animationContext["presentedView"] = view;
    
    if (pc != null)
        pc.presentationTransitionWillBegin();

    var ac = null;
    if (toVC.transitioningDelegate != null)
    {
        ac = toVC.transitioningDelegate.animationControllerForPresentedController(toVC, fromVC, sourceVC);
    }
    else if (sourceVC != null && sourceVC.transitioningDelegate != null)
    {
        ac = sourceVC.transitioningDelegate.animationControllerForPresentedController(toVC, fromVC, sourceVC);
    }
    else if (pc != null)
    {
        ac = pc.transitioningDelegate.animationControllerForPresentedController(toVC, fromVC, sourceVC);
    }

    //view.setNeedsDisplay();

    var layer = view.layer;
        
    _MUIAnimationStart(layer, ac, animationContext, this, function () {

        toVC.viewDidAppear();
        //toVC._childControllersDidAppear();

        if (toVC.modalPresentationStyle == MUIModalPresentationStyle.FullScreen
            || toVC.modalPresentationStyle == MUIModalPresentationStyle.CurrentContext) {

            fromVC.viewDidDisappear();
            //fromVC._childControllersDidDisappear();
        }
        if (pc != null) {
            pc.presentationTransitionDidEnd(true);
            pc._isPresented = true;
        }

        if (target != null && completion != null)
            completion.call(target);
    });
}

export function _MUIHideViewController(fromVC, toVC, sourceVC, target?, completion?)
{
    if (fromVC.modalPresentationStyle == MUIModalPresentationStyle.FullScreen
        || fromVC.modalPresentationStyle == MUIModalPresentationStyle.CurrentContext
        || MIOCoreIsPhone() == true) {

        toVC.viewWillAppear();
        //toVC._childControllersWillAppear();

        //toVC.view.layout();
    }

    fromVC.viewWillDisappear();
    //fromVC._childControllersWillDisappear();

    var view = null;
    var pc = null;

    if (fromVC.modalPresentationStyle == MUIModalPresentationStyle.FullScreen
        || fromVC.modalPresentationStyle == MUIModalPresentationStyle.PageSheet
        || fromVC.modalPresentationStyle == MUIModalPresentationStyle.FormSheet
        || fromVC.modalPresentationStyle == MUIModalPresentationStyle.Custom
        || fromVC.modalPresentationStyle == MUIModalPresentationStyle.Popover) {

        pc = fromVC.presentationController;
        view = pc.presentedView;
    }
    else
        view = fromVC.view;

    var ac = null;
    if (fromVC.transitioningDelegate != null)
    {
        ac = fromVC.transitioningDelegate.animationControllerForDismissedController(fromVC);
    }
    else if (sourceVC != null && sourceVC.transitioningDelegate != null)
    {
        ac = sourceVC.transitioningDelegate.animationControllerForDismissedController(fromVC);
    }
    else if (pc != null)
    {
        ac = pc.transitioningDelegate.animationControllerForDismissedController(fromVC);
    }

    var animationContext = {};
    animationContext["presentingViewController"] = fromVC;
    animationContext["presentedViewController"] = toVC;
    animationContext["presentedView"] = view;

    var layer = view.layer;

    if (pc != null)
        pc.dismissalTransitionWillBegin();

    _MUIAnimationStart(layer, ac, animationContext, this, function () {

        if (fromVC.modalPresentationStyle == MUIModalPresentationStyle.FullScreen
            || fromVC.modalPresentationStyle == MUIModalPresentationStyle.CurrentContext) {

            toVC.viewDidAppear();
            //toVC._childControllersDidAppear();
        }

        fromVC.viewDidDisappear();
        //fromVC._childControllersDidDisappear();

        if (pc != null){
            pc.dismissalTransitionDidEnd(true);
            pc._isPresented = false;
        }

        if (target != null && completion != null)
            completion.call(target);
    });
}

export function _MUITransitionFromViewControllerToViewController(fromVC, toVC, sourceVC, target?, completion?)
{
    toVC.viewWillAppear();
    //toVC._childControllersWillAppear();

    fromVC.viewWillDisappear();                
    //fromVC._childControllersWillDisappear();
    
    //toVC.view.layout();

    let ac = null;
    if (toVC.transitioningDelegate != null)
    {
        ac = toVC.transitioningDelegate.animationControllerForPresentedController(toVC, fromVC, sourceVC);
    }
    else if (sourceVC != null && sourceVC.transitioningDelegate != null)
    {
        ac = sourceVC.transitioningDelegate.animationControllerForPresentedController(toVC, fromVC, sourceVC);
    }

    let animationContext = {};
    animationContext["presentingViewController"] = fromVC;
    animationContext["presentedViewController"] = toVC;
    animationContext["presentedView"] = toVC;

    let layer = toVC.view.layer;

    _MUIAnimationStart(layer, ac, animationContext, this, function () {

        toVC.viewDidAppear();
        //toVC._childControllersDidAppear();

        fromVC.viewDidDisappear();
        //fromVC._childControllersDidDisappear();

        if (target != null && completion != null)
            completion.call(target);
    });
}

