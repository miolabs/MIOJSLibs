/**
 * Created by godshadow on 11/11/2016.
 */

/// <reference path="MIOViewController_PresentationController.ts" />

enum MIOPopoverArrowDirection
{
    Any,
    Up,
    Down,
    Left,
    Right
}

class MIOPopoverPresentationController extends MIOPresentationController
{
    permittedArrowDirections = MIOPopoverArrowDirection.Any;

    sourceView = null;
    sourceRect = MIOFrame.Zero();

    delegate = null;

    private _rootViewController = null;

    private _canvasLayer = null;

    initWithRootViewController(vc)
    {
        super.init();

        this._rootViewController = vc;
        this.addChildViewController(vc);

        var contentSize = vc.preferredContentSize;

        this._canvasLayer = document.createElement("CANVAS");
        this._canvasLayer.setAttribute("width", contentSize.width);
        this._canvasLayer.setAttribute("height", contentSize.height);
    }

    viewDidLoad()
    {
        super.viewDidLoad();

        this._drawPopOverBorder();
    }

    private _drawPopOverBorder()
    {
        var context = this._canvasLayer.getContext('2d');

        var w = this.view.getWidth();
        var radius = 3;

        var color = 'rgba(170, 170, 170, 1)';


        //// Bezier Drawing
        context.beginPath();
        // Left corner
        context.moveTo(0, radius);
        context.bezierCurveTo(0, 0, w, 0, radius, 0);
        context.lineTo(w - radius, 0);


        context.closePath();
        context.strokeStyle = color;
        context.lineWidth = 1;
        context.stroke();

    }

}