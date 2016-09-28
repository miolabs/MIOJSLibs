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
    FullScreen
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

function AnimationClassesForPresentationType(type, reverse)
{
    var clasess = null;

    switch (type)
    {
        case MIOPresentationType.Sheet:
            clasess = ClassListForAnimationType(reverse == false ? MIOAnimationType.BeginSheet : MIOAnimationType.EndSheet);
            break;

        case MIOPresentationType.Modal:
            if (MIOCoreIsMobile())
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
        w = vc.contentSize.width;
        h = vc.contentSize.height;
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
    else
    {
        w = view.getWidth();
        h = view.getHeight();
    }

    return MIOFrame.frameWithRect(x, y, w, h);
}