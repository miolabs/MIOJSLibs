/**
 * Created by godshadow on 01/09/16.
 */

/// <reference path="MIOView.ts" />

class MIOScrollView extends MIOView
{
    pagingEnabled = false;
    delegate = null;

    private _lastOffsetX = 0;

    protected _customizeLayerSetup()
    {
        super._customizeLayerSetup();

        var instance = this;
        this.layer.onscroll = function (e) {

            instance._layerDidScroll.call(instance);
        };

        this.layer.onwheel = function () {

            instance._layerDidMouseUp.call(instance);
        };
    }

    private _layerDidMouseUp()
    {
        // if (this.pagingEnabled)
        // {
        //     var width = this.getWidth();
        //     var offset = this.layer.scrollLeft;
        //     if (this._lastOffsetX < offset)
        //     {
        //         // to the right
        //         if (offset >= width)
        //         {
        //             this.layer.classList.add("scroll_left_animation");
        //             this.layer.style.transform = "translate(" + width + "px)";
        //         }
        //     }
        //     else
        //     {
        //         // to the left
        //     }
        // }
    }

    private _layerDidScroll()
    {
        if (this.delegate != null && typeof this.delegate.scrollViewDidScroll === "function")
            this.delegate.scrollViewDidScroll.call(this.delegate, this);
    }

    get contentOffset()
    {
        var p = new MIOPoint(this.layer.scrollLeft, this.layer.scrollTop);
        return p;
    }
}