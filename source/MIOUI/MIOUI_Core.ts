
/// <reference path="MIOUI_CoreAnimation.ts" />
/// <reference path="MUIView.ts" />

interface Window {
    prototype;
}

interface Event {
    touches:TouchList;
    targetTouches:TouchList;
    changedTouches:TouchList;
};

function MUIOutlet(owner, elementID, className?, options?)
{
    //var layer = document.getElementById(elementID);
    var layer = null;

    if (owner instanceof MUIView)
        layer = MUILayerSearchElementByID(owner.layer, elementID);
    else if (owner instanceof MUIViewController)
        layer = MUILayerSearchElementByID(owner.view.layer, elementID);

    if (className == null)
        className = layer.getAttribute("data-class");

    if (className == null)
        className = "MIOView";

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
    var h = document.body.clientHeight;

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
    if (toVC.modalPresentationStyle == MUIModalPresentationStyle.FullScreen
        || toVC.modalPresentationStyle == MUIModalPresentationStyle.PageSheet
        || toVC.modalPresentationStyle == MUIModalPresentationStyle.FormSheet
        || toVC.modalPresentationStyle == MUIModalPresentationStyle.Custom) {
        
        var pc = toVC.presentationController;
        view = pc.presentedView;
    }
    else
        view = toVC.view;

    view.layout();

    var ac = null;
    if (toVC.transitioningDelegate != null)
    {
        ac = toVC.transitioningDelegate.animationControllerForPresentedController(toVC, fromVC, sourceVC);
    }
    else if (sourceVC != null && sourceVC.transitioningDelegate != null)
    {
        ac = sourceVC.transitioningDelegate.animationControllerForPresentedController(toVC, fromVC, sourceVC);
    }
    // else
    // {
    //     if (toVC.modalPresentationStyle == MUIModalPresentationStyle.Popover)
    //         ac = new MIOPopOverPresentAnimationController();
    //     else if (modal == true)
    //         ac = new MIOModalPresentAnimationController();
    //     else
    //         ac = new MIOPresentAnimationController();

    //     ac.init();
    // }

    var animationContext = {};
    animationContext["presentingViewController"] = fromVC;
    animationContext["presentedViewController"] = toVC;
    animationContext["presentedView"] = view;

    var layer = view.layer;

    if (pc != null)
        pc.presentationTransitionWillBegin();

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
    if (fromVC.modalPresentationStyle == MUIModalPresentationStyle.FullScreen
        || fromVC.modalPresentationStyle == MUIModalPresentationStyle.PageSheet
        || fromVC.modalPresentationStyle == MUIModalPresentationStyle.FormSheet
        || fromVC.modalPresentationStyle == MUIModalPresentationStyle.Custom) {

        var pc = fromVC.presentationController;
        view = pc.presentedView;
    }
    else
        view = fromVC.view;

    var ac = null;
    if (toVC.transitioningDelegate != null)
    {
        ac = toVC.transitioningDelegate.animationControllerForDismissedController(fromVC);
    }
    else if (sourceVC != null && sourceVC.transitioningDelegate != null)
    {
        ac = sourceVC.transitioningDelegate.animationControllerForDismissedController(toVC);
    }
    else
    {
        if (fromVC.modalPresentationStyle == MUIModalPresentationStyle.Popover)
            ac = new MIOPopOverDismissAnimationController();
        else
            ac = new MIOModalDismissAnimationController();

        ac.init();
    }

    var animationContext = {};
    animationContext["presentingViewController"] = fromVC;
    animationContext["presentedViewController"] = toVC;
    animationContext["presentedView"] = view;

    var layer = view.layer;

    var pc = fromVC.presentationController;
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

