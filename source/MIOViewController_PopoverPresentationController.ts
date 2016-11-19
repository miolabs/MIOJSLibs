/**
 * Created by godshadow on 11/11/2016.
 */

/// <reference path="MIOViewController.ts" />

enum MIOPopoverArrowDirection
{
    Any,
    Up,
    Down,
    Left,
    Right
}

class MIOPopoverPresentationController extends MIOViewController
{
    permittedArrowDirections = MIOPopoverArrowDirection.Any;

    sourceView = null;
    sourceRect = MIOFrame.Zero();

    delegate = null;

    private _rootViewController = null;

    initWithRootViewController(vc)
    {
        super.init();

        this._rootViewController = vc;
        this.addChildViewController(vc);
    }


}