/**
 * Created by godshadow on 17/08/16.
 */
/// <reference path="MIOCore.ts" />
/// <reference path="MIOCoreTypes.ts" />
var MIOPresentationStyle;
(function (MIOPresentationStyle) {
    MIOPresentationStyle[MIOPresentationStyle["CurrentContext"] = 0] = "CurrentContext";
    MIOPresentationStyle[MIOPresentationStyle["PageSheet"] = 1] = "PageSheet";
    MIOPresentationStyle[MIOPresentationStyle["FormSheet"] = 2] = "FormSheet";
    MIOPresentationStyle[MIOPresentationStyle["FullScreen"] = 3] = "FullScreen";
    MIOPresentationStyle[MIOPresentationStyle["ModalPresentationPopover"] = 4] = "ModalPresentationPopover";
})(MIOPresentationStyle || (MIOPresentationStyle = {}));
var MIOPresentationType;
(function (MIOPresentationType) {
    MIOPresentationType[MIOPresentationType["Sheet"] = 0] = "Sheet";
    MIOPresentationType[MIOPresentationType["Modal"] = 1] = "Modal";
    MIOPresentationType[MIOPresentationType["Navigation"] = 2] = "Navigation";
})(MIOPresentationType || (MIOPresentationType = {}));
var MIOAnimationType;
(function (MIOAnimationType) {
    MIOAnimationType[MIOAnimationType["None"] = 0] = "None";
    MIOAnimationType[MIOAnimationType["BeginSheet"] = 1] = "BeginSheet";
    MIOAnimationType[MIOAnimationType["EndSheet"] = 2] = "EndSheet";
    MIOAnimationType[MIOAnimationType["Push"] = 3] = "Push";
    MIOAnimationType[MIOAnimationType["Pop"] = 4] = "Pop";
    MIOAnimationType[MIOAnimationType["FlipLeft"] = 5] = "FlipLeft";
    MIOAnimationType[MIOAnimationType["FlipRight"] = 6] = "FlipRight";
    MIOAnimationType[MIOAnimationType["FadeIn"] = 7] = "FadeIn";
    MIOAnimationType[MIOAnimationType["FadeOut"] = 8] = "FadeOut";
    MIOAnimationType[MIOAnimationType["LightSpeedIn"] = 9] = "LightSpeedIn";
    MIOAnimationType[MIOAnimationType["LightSpeedOut"] = 10] = "LightSpeedOut";
    MIOAnimationType[MIOAnimationType["Hinge"] = 11] = "Hinge";
    MIOAnimationType[MIOAnimationType["SlideInUp"] = 12] = "SlideInUp";
    MIOAnimationType[MIOAnimationType["SlideOutDown"] = 13] = "SlideOutDown";
})(MIOAnimationType || (MIOAnimationType = {}));
// ANIMATION TYPES
function ClassListForAnimationType(type) {
    var array = [];
    array.push("animated");
    switch (type) {
        case MIOAnimationType.BeginSheet:
            array.push("slideInDown");
            break;
        case MIOAnimationType.EndSheet:
            array.push("slideOutUp");
            break;
        case MIOAnimationType.Push:
            array.push("slideInRight");
            break;
        case MIOAnimationType.Pop:
            array.push("slideOutRight");
            break;
        case MIOAnimationType.FadeIn:
            array.push("fadeIn");
            break;
        case MIOAnimationType.FadeOut:
            array.push("fadeOut");
            break;
        case MIOAnimationType.LightSpeedOut:
            array.push("lightSpeedOut");
            break;
        case MIOAnimationType.Hinge:
            array.push("hinge");
            break;
        case MIOAnimationType.SlideInUp:
            array.push("slideInUp");
            break;
        case MIOAnimationType.SlideOutDown:
            array.push("slideOutDown");
            break;
    }
    return array;
}
function AnimationTypeForViewController(vc, reverse) {
    var type = MIOAnimationType.None;
    switch (vc.presentationType) {
        case MIOPresentationType.Sheet:
            type = (reverse == false ? MIOAnimationType.BeginSheet : MIOAnimationType.EndSheet);
            break;
        case MIOPresentationType.Modal:
            if (vc.presentationStyle == MIOPresentationStyle.ModalPresentationPopover)
                type = (reverse == false ? MIOAnimationType.FadeIn : MIOAnimationType.FadeOut);
            else if (MIOLibIsMobile())
                type = (reverse == false ? MIOAnimationType.SlideInUp : MIOAnimationType.SlideOutDown);
            else
                type = (reverse == false ? MIOAnimationType.BeginSheet : MIOAnimationType.EndSheet);
            break;
        case MIOPresentationType.Navigation:
            type = (reverse == false ? MIOAnimationType.Push : MIOAnimationType.Pop);
            break;
    }
    return type;
}
function AnimationClassesForPresentationType(type, reverse) {
    var clasess = null;
    switch (type) {
        case MIOPresentationType.Sheet:
            clasess = ClassListForAnimationType(reverse == false ? MIOAnimationType.BeginSheet : MIOAnimationType.EndSheet);
            break;
        case MIOPresentationType.Modal:
            if (MIOLibIsMobile())
                clasess = ClassListForAnimationType(reverse == false ? MIOAnimationType.SlideInUp : MIOAnimationType.SlideOutDown);
            else
                clasess = ClassListForAnimationType(reverse == false ? MIOAnimationType.BeginSheet : MIOAnimationType.EndSheet);
            break;
        case MIOPresentationType.Navigation:
            clasess = ClassListForAnimationType(reverse == false ? MIOAnimationType.Push : MIOAnimationType.Pop);
            break;
    }
    return clasess;
}
function AddAnimationClassesForType(vc, reverse) {
    var classes = AnimationClassesForPresentationType(vc.presentationType, reverse);
    AddAnimationClasses(vc, classes);
}
function RemoveAnimationClassesForType(vc, reverse) {
    var classes = AnimationClassesForPresentationType(vc.presentationType, reverse);
    RemoveAnimationClasses(vc, classes);
}
function AddAnimationClasses(vc, classes) {
    for (var index = 0; index < classes.length; index++)
        vc.view.layer.classList.add(classes[index]);
}
function RemoveAnimationClasses(vc, classes) {
    for (var index = 0; index < classes.length; index++)
        vc.view.layer.classList.remove(classes[index]);
}
function FrameWithStyleForViewControllerInView(view, vc) {
    var w = 0;
    var h = 0;
    var x = 0;
    var y = 0;
    if (vc.presentationStyle == MIOPresentationStyle.PageSheet) {
        w = vc.preferredContentSize.width;
        h = vc.preferredContentSize.height;
        x = (view.getWidth() - w) / 2;
        y = 0;
    }
    else if (vc.presentationStyle == MIOPresentationStyle.FormSheet) {
        w = view.getWidth() * 0.75; // 75% of the view
        h = view.getHeight() * 0.90; // 90% of the view
        x = (view.getWidth() - w) / 2;
        y = (view.getHeight() - h) / 2;
    }
    else if (vc.presentationStyle == MIOPresentationStyle.ModalPresentationPopover) {
        w = vc.preferredContentSize.width;
        h = vc.preferredContentSize.height;
        var v = vc.popoverPresentationController().sourceView;
        var f = vc.popoverPresentationController().sourceRect;
        x = v.layer.getBoundingClientRect().left + f.size.width + 10;
        if ((x + w) > window.innerWidth)
            x = v.layer.getBoundingClientRect().left - w - 10;
        //y = (window.innerHeight - h) / 2;
        y = v.layer.getBoundingClientRect().top + f.size.height + 10;
    }
    else {
        w = view.getWidth();
        h = view.getHeight();
    }
    vc.contentSize = new MIOSize(w, h);
    return MIOFrame.frameWithRect(x, y, w, h);
}
//# sourceMappingURL=MIOViewController_Animation.js.map