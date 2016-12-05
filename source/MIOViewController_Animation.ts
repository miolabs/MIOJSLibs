/**
 * Created by godshadow on 17/08/16.
 */

/// <reference path="MIOCore.ts" />
/// <reference path="MIOCoreTypes.ts" />

enum MIOPresentationStyle
{
    CurrentContext,
    PageSheet,
    FormSheet,
    FullScreen,
    ModalPresentationPopover
}

enum MIOPresentationType
{
    Sheet,
    Modal,
    Navigation
}

enum MIOAnimationType
{
    None,
    BeginSheet,
    EndSheet,
    Push,
    Pop,
    FlipLeft,
    FlipRight,
    FadeIn,
    FadeOut,
    LightSpeedIn,
    LightSpeedOut,
    Hinge,
    SlideInUp,
    SlideOutDown
}

// ANIMATION TYPES
function ClassListForAnimationType(type)
{
    var array = [];
    array.push("animated");

    switch (type)
    {
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

function AnimationTypeForViewController(vc, reverse)
{
    var type = MIOAnimationType.None;

    switch (vc.presentationType)
    {
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

function AnimationClassesForPresentationType(type, reverse)
{
    var clasess = null;

    switch (type)
    {
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

function AddAnimationClassesForType(vc, reverse)
{
    var classes = AnimationClassesForPresentationType(vc.presentationType, reverse);
    AddAnimationClasses(vc, classes);
}

function RemoveAnimationClassesForType(vc, reverse)
{
    var classes = AnimationClassesForPresentationType(vc.presentationType, reverse);
    RemoveAnimationClasses(vc, classes);
}

function  AddAnimationClasses(vc, classes)
{
    for (var index = 0; index < classes.length; index++)
        vc.view.layer.classList.add(classes[index]);
}

function RemoveAnimationClasses(vc, classes)
{
    for (var index = 0; index < classes.length; index++)
        vc.view.layer.classList.remove(classes[index]);
}

function FrameWithStyleForViewControllerInView(view, vc)
{
    var w = 0;
    var h = 0;
    var x = 0;
    var y = 0;

    if (vc.presentationStyle == MIOPresentationStyle.PageSheet)
    {
        w = vc.preferredContentSize.width;
        h = vc.preferredContentSize.height;
        x = (view.getWidth() - w) / 2;
        y = 0;
    }
    else if (vc.presentationStyle == MIOPresentationStyle.FormSheet)
    {
        w = view.getWidth() * 0.75; // 75% of the view
        h = view.getHeight() * 0.90; // 90% of the view
        x = (view.getWidth() - w) / 2;
        y = (view.getHeight() - h) / 2;
    }
    else if (vc.presentationStyle == MIOPresentationStyle.ModalPresentationPopover)
    {
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
    else
    {
        w = view.getWidth();
        h = view.getHeight();
    }

    vc.contentSize = new MIOSize(w, h);
    return MIOFrame.frameWithRect(x, y, w, h);
}

