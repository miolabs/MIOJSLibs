/**
 * Created by godshadow on 12/3/16.
 */

/// <reference path="MUIView.ts" />

class MUIControl extends MUIView
{
    enabled = true;

    // TODO: Make delegation of the methods above
    mouseOverTarget = null;
    mouseOverAction = null;
    mouseOutTarget = null;
    mouseOutAction = null;

    setEnabled(enabled)
    {
        this.enabled = enabled;

        if (enabled == true)
            this.layer.style.opacity = "1.0";
        else
            this.layer.style.opacity = "0.10";
    }

     setOnMouseOverAction(target, action)
     {
         this.mouseOverTarget = target;
         this.mouseOverAction = action;
         var instance = this;

         this.layer.onmouseover = function()
         {
             if (instance.enabled)
                 instance.mouseOverAction.call(target);
         }
     }

     setOnMouseOutAction(target, action)
     {
         this.mouseOutTarget = target;
         this.mouseOutAction = action;
         var instance = this;

         this.layer.onmouseout = function()
         {
             if (instance.enabled)
                 instance.mouseOutAction.call(target);
         }
     }
}

