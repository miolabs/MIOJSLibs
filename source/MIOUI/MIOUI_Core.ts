
/// <reference path="MIOUI_CoreAnimation.ts" />
/// <reference path="MUIView.ts" />
/// <reference path="MUIViewController.ts" />

interface Window {
    prototype;
}

function MUIOutlet(owner, elementID, className?, options?)
{
    //var layer = document.getElementById(elementID);
    var layer = null;

    if (owner instanceof MUIView)
        layer = MUILayerSearchElementByID(owner.layer, elementID);
    else if (owner instanceof MUIViewController)
        layer = MUILayerSearchElementByID(owner.view.layer, elementID);

    if (layer == null) 
        throw ("DIV identifier specified is not valid (" + elementID + ")");

    if (className == null)
        className = layer.getAttribute("data-class");

    if (className == null)
        className = "MUIView";

    var c = MIOClassFromString(className);
    c.initWithLayer(layer, options);

    if (owner instanceof MUIView)
        owner._linkViewToSubview(c);
    else if (owner instanceof MUIViewController)
        owner.view._linkViewToSubview(c);

    if (c instanceof MUIView)
        c.awakeFromHTML();

    if (c instanceof MUIViewController)
        owner.addChildViewController(c);

    return c;
}

function MUIWindowSize()
{
    var w = document.body.clientWidth;
    //var h = document.body.clientHeight;window.innerHeight
    var h = window.innerHeight;

    return new MIOSize(w, h);
}

function _MIUShowViewController(fromVC, toVC, sourceVC, target?, completion?)
{
    toVC.viewWillAppear();
    toVC._childControllersWillAppear();

    if (toVC.modalPresentationStyle == MUIModalPresentationStyle.FullScreen
        || toVC.modalPresentationStyle == MUIModalPresentationStyle.CurrentContext) {

        fromVC.viewWillDisappear();
        fromVC._childControllersWillDisappear();
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

    view.layout();

    var layer = view.layer;
        
    _MUIAnimationStart(layer, ac, animationContext, this, function () {

        toVC.viewDidAppear();
        toVC._childControllersDidAppear();

        if (toVC.modalPresentationStyle == MUIModalPresentationStyle.FullScreen
            || toVC.modalPresentationStyle == MUIModalPresentationStyle.CurrentContext) {

            fromVC.viewDidDisappear();
            fromVC._childControllersDidDisappear();
        }
        if (pc != null)
            pc.presentationTransitionDidEnd(true);

        if (target != null && completion != null)
            completion.call(target);
    });
}

function _MUIHideViewController(fromVC, toVC, sourceVC, target?, completion?)
{
    if (fromVC.modalPresentationStyle == MUIModalPresentationStyle.FullScreen
        || fromVC.modalPresentationStyle == MUIModalPresentationStyle.CurrentContext) {

        toVC.viewWillAppear();
        toVC._childControllersWillAppear();

        toVC.view.layout();
    }

    fromVC.viewWillDisappear();
    fromVC._childControllersWillDisappear();

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
            toVC._childControllersDidAppear();
        }

        fromVC.viewDidDisappear();
        fromVC._childControllersDidDisappear();

        if (pc != null)
            pc.dismissalTransitionDidEnd(true);

        if (target != null && completion != null)
            completion.call(target);
    });
}

function _MUITransitionFromViewControllerToViewController(fromVC, toVC, sourceVC, target?, completion?)
{
    toVC.viewWillAppear();
    toVC._childControllersWillAppear();

    fromVC.viewWillDisappear();                
    fromVC._childControllersWillDisappear();
    
    toVC.view.layout();

    var ac = null;
    if (toVC.transitioningDelegate != null)
    {
        ac = toVC.transitioningDelegate.animationControllerForPresentedController(toVC, fromVC, sourceVC);
    }
    else if (sourceVC != null && sourceVC.transitioningDelegate != null)
    {
        ac = sourceVC.transitioningDelegate.animationControllerForPresentedController(toVC, fromVC, sourceVC);
    }

    var animationContext = {};
    animationContext["presentingViewController"] = fromVC;
    animationContext["presentedViewController"] = toVC;
    animationContext["presentedView"] = toVC;

    var layer = toVC.view.layer;

    _MUIAnimationStart(layer, ac, animationContext, this, function () {

        toVC.viewDidAppear();
        toVC._childControllersDidAppear();

        fromVC.viewDidDisappear();
        fromVC._childControllersDidDisappear();

        if (target != null && completion != null)
            completion.call(target);
    });
}

