/**
 * Created by godshadow on 05/12/2016.
 */
/// <reference path="MIOView.ts" />
/// <reference path="MIOViewController.ts" />
function MUIOutlet(owner, elementID, className, options) {
    //var layer = document.getElementById(elementID);
    var layer = null;
    if (owner instanceof MIOView)
        layer = MIOLayerSearchElementByID(owner.layer, elementID);
    else if (owner instanceof MIOViewController)
        layer = MIOLayerSearchElementByID(owner.view.layer, elementID);
    if (className == null)
        className = layer.getAttribute("data-class");
    if (className == null)
        className = "MIOView";
    var c = MIOClassFromString(className);
    c.initWithLayer(layer, options);
    if (owner instanceof MIOView)
        owner._linkViewToSubview(c);
    else if (owner instanceof MIOViewController)
        owner.view._linkViewToSubview(c);
    if (c instanceof MIOView)
        c.awakeFromHTML();
    if (c instanceof MIOViewController)
        owner.addChildViewController(c);
    return c;
}
function MUIWindowSize() {
    var w = document.body.clientWidth;
    var h = document.body.clientHeight;
    return new MIOSize(w, h);
}
/*
    ANIMATIONS
 */
var MUIAnimationType;
(function (MUIAnimationType) {
    MUIAnimationType[MUIAnimationType["None"] = 0] = "None";
    MUIAnimationType[MUIAnimationType["BeginSheet"] = 1] = "BeginSheet";
    MUIAnimationType[MUIAnimationType["EndSheet"] = 2] = "EndSheet";
    MUIAnimationType[MUIAnimationType["Push"] = 3] = "Push";
    MUIAnimationType[MUIAnimationType["Pop"] = 4] = "Pop";
    MUIAnimationType[MUIAnimationType["FlipLeft"] = 5] = "FlipLeft";
    MUIAnimationType[MUIAnimationType["FlipRight"] = 6] = "FlipRight";
    MUIAnimationType[MUIAnimationType["FadeIn"] = 7] = "FadeIn";
    MUIAnimationType[MUIAnimationType["FadeOut"] = 8] = "FadeOut";
    MUIAnimationType[MUIAnimationType["LightSpeedIn"] = 9] = "LightSpeedIn";
    MUIAnimationType[MUIAnimationType["LightSpeedOut"] = 10] = "LightSpeedOut";
    MUIAnimationType[MUIAnimationType["Hinge"] = 11] = "Hinge";
    MUIAnimationType[MUIAnimationType["SlideInUp"] = 12] = "SlideInUp";
    MUIAnimationType[MUIAnimationType["SlideOutDown"] = 13] = "SlideOutDown";
})(MUIAnimationType || (MUIAnimationType = {}));
// ANIMATION TYPES
function MUIClassListForAnimationType(type) {
    var array = [];
    array.push("animated");
    switch (type) {
        case MUIAnimationType.BeginSheet:
            array.push("slideInDown");
            break;
        case MUIAnimationType.EndSheet:
            array.push("slideOutUp");
            break;
        case MUIAnimationType.Push:
            array.push("slideInRight");
            break;
        case MUIAnimationType.Pop:
            array.push("slideOutRight");
            break;
        case MUIAnimationType.FadeIn:
            array.push("fadeIn");
            break;
        case MUIAnimationType.FadeOut:
            array.push("fadeOut");
            break;
        case MUIAnimationType.LightSpeedOut:
            array.push("lightSpeedOut");
            break;
        case MUIAnimationType.Hinge:
            array.push("hinge");
            break;
        case MUIAnimationType.SlideInUp:
            array.push("slideInUp");
            break;
        case MUIAnimationType.SlideOutDown:
            array.push("slideOutDown");
            break;
    }
    return array;
}
function _MUIAddAnimations(layer, animations) {
    for (var index = 0; index < animations.length; index++)
        layer.classList.add(animations[index]);
}
function _MUIRemoveAnimations(layer, animations) {
    for (var index = 0; index < animations.length; index++)
        layer.classList.remove(animations[index]);
}
function _MIUShowViewController(fromVC, toVC, sourceVC, target, completion) {
    toVC.viewWillAppear();
    toVC._childControllersWillAppear();
    if (toVC.presentationStyle == MIOModalPresentationStyle.FullScreen
        || toVC.presentationStyle == MIOModalPresentationStyle.CurrentContext) {
        fromVC.viewWillDisappear();
        fromVC._childControllersWillDisappear();
    }
    toVC.view.layout();
    var ac = null;
    if (toVC.transitioningDelegate != null) {
        ac = toVC.transitioningDelegate.animationControllerForPresentedController(toVC, fromVC, sourceVC);
    }
    else if (sourceVC.transitioningDelegate != null) {
        ac = sourceVC.transitioningDelegate.animationControllerForPresentedController(toVC, fromVC, sourceVC);
    }
    else {
        ac = new MIOModalPresentAnimationController();
        ac.init();
    }
    var animationContext = {};
    animationContext["presentingViewController"] = fromVC;
    animationContext["presentedViewController"] = toVC;
    var layer = toVC.view.layer;
    var pc = toVC.presentationController;
    if (pc != null)
        pc.presentationTransitionWillBegin();
    _MUIAnimationStart(layer, ac, animationContext, this, function () {
        toVC.viewDidAppear();
        toVC._childControllersDidAppear();
        if (toVC.presentationStyle == MIOModalPresentationStyle.FullScreen
            || toVC.presentationStyle == MIOModalPresentationStyle.CurrentContext) {
            fromVC.viewDidDisappear();
            fromVC._childControllersDidDisappear();
        }
        if (pc != null)
            pc.presentationTransitionDidEnd(true);
        if (target != null && completion != null)
            completion.call(target);
    });
}
function _MUIDismissViewController(fromVC, toVC, sourceVC, target, completion) {
    if (fromVC.presentationStyle == MIOModalPresentationStyle.FullScreen
        || fromVC.presentationStyle == MIOModalPresentationStyle.CurrentContext) {
        toVC.viewWillAppear();
        toVC._childControllersWillAppear();
        toVC.view.layout();
    }
    fromVC.viewWillDisappear();
    fromVC._childControllersWillDisappear();
    var ac = null;
    if (fromVC.transitioningDelegate != null) {
        ac = fromVC.transitioningDelegate.animationControllerForDismissedController(fromVC);
    }
    else if (sourceVC.transitioningDelegate != null) {
        ac = sourceVC.transitioningDelegate.animationControllerForDismissedController(toVC);
    }
    else {
        ac = new MIOModalDismissAnimationController();
        ac.init();
    }
    var animationContext = {};
    animationContext["presentingViewController"] = fromVC;
    animationContext["presentedViewController"] = toVC;
    var layer = fromVC.view.layer;
    var pc = fromVC.presentationController;
    if (pc != null)
        pc.dismissalTransitionWillBegin();
    _MUIAnimationStart(layer, ac, animationContext, this, function () {
        if (fromVC.presentationStyle == MIOModalPresentationStyle.FullScreen
            || fromVC.presentationStyle == MIOModalPresentationStyle.CurrentContext) {
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
function _MUIAnimationStart(layer, animationController, animationContext, target, completion) {
    var duration = animationController.transitionDuration(animationContext);
    var animations = animationController.animations(animationContext);
    animationController.animateTransition(animationContext);
    if (duration == 0 || animations == null) {
        // NO animation
        animationController.animationEnded(true);
        if (target != null && completion != null)
            completion.call(target);
        return;
    }
    layer.style.animationDuration = duration + "s";
    _MUIAddAnimations(layer, animations);
    layer.animationParams = {};
    layer.animationParams["animationController"] = animationController;
    layer.animationParams["animations"] = animations;
    if (target != null)
        layer.animationParams["target"] = target;
    if (completion != null)
        layer.animationParams["completion"] = completion;
    layer.addEventListener("animationend", _MUIAnimationDidFinish);
}
function _MUIAnimationDidFinish(event) {
    var animationController = event.target.animationParams["animationController"];
    var animations = event.target.animationParams["animations"];
    var target = event.target.animationParams["target"];
    var completion = event.target.animationParams["completion"];
    var layer = event.target;
    _MUIRemoveAnimations(layer, animations);
    layer.removeEventListener("animationend", _MUIAnimationDidFinish);
    animationController.animationEnded(true);
    if (target != null && completion != null)
        completion.call(target);
}
//# sourceMappingURL=MIOUIKit.js.map