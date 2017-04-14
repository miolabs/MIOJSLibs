/**
 * Created by godshadow on 01/09/16.
 */

/// <reference path="MUIView.ts" />


class MUIScrollView extends MUIView
{
    pagingEnabled = false;
    delegate = null;
    scrolling = false;

    private _scrollTimer = null;

    private _lastOffsetX = 0;

    initWithLayer(layer, owner, options?)
    {
        super.initWithLayer(layer, owner, options);

        var instance = this;
        this.layer.onscroll = function (e) {

            instance._scrollEventCallback.call(instance);
        };
        
        this.layer.onwheel = function (e) {

            instance._scrollEventCallback.call(instance);
        };
    }

    private _layerOnScrollEvent(e)
    {
        
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


    private _scrollEventCallback()
    {
        if (this.scrolling == false)
        {
            this.scrolling = true;
            this.didStartScroll();
        }

        if (this._scrollTimer != null) this._scrollTimer.invalidate();
        this._scrollTimer = MIOTimer.scheduledTimerWithTimeInterval(150, false, this, this._scrollEventStopCallback);

        this.didScroll();

        if (this.delegate != null && typeof this.delegate.scrollViewDidScroll === "function")
            this.delegate.scrollViewDidScroll.call(this.delegate, this);        
    }

    private _scrollEventStopCallback()
    {
        this.scrolling = false;

        this.didStopScroll();
    }

    protected didStartScroll()
    {
        console.log("START SCROLL");
    }

    protected didScroll()
    {
        console.log("DID SCROLL");
    }

    protected didStopScroll()
    {
        console.log("STOP SCROLL");        
    }

    get contentOffset()
    {
        var p = new MIOPoint(this.layer.scrollLeft, this.layer.scrollTop);
        return p;
    }

    scrollToTop(animate?)
    {
        // if (true)
        //     this.layer.style.transition = "scrollTop 0.25s";

        this.layer.scrollTop = 0;
    }

    scrollToBottom(animate?)
    {
        // if (true)
        //     this.layer.style.transition = "scrollTop 0.25s";

        this.layer.scrollTop = this.layer.scrollHeight;
    }

    scrollToPoint(x, y, animate?)
    {
        this.layer.scrollTop = y;
    }

    scrollRectToVisible(rect, animate?)
    {
        //TODO: Implement this
    }
}