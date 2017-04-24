/**
 * Created by godshadow on 01/09/16.
 */

/// <reference path="MUIView.ts" />


class MUIScrollView extends MUIView
{
    pagingEnabled = false;
    delegate = null;
    scrolling = false;

    private _showsVerticalScrollIndicator:boolean = true;
    set showsVerticalScrollIndicator(value:boolean) {this.setShowsVerticalScrollIndicator(value);}
    get showsVerticalScrollIndicator():boolean {return this._showsVerticalScrollIndicator;}

    private _contentView = null;
    private _scrollTimer = null;

    private _lastOffsetY = 0;

    init()
    {
        super.init();
        this._setupLayer();
    }

    initWithLayer(layer, owner, options?)
    {
        super.initWithLayer(layer, owner, options);        
        this._setupLayer();
    }

    private _setupLayer()
    {
        this.layer.style.overflow = "hidden";

        var contentLayer = MUICoreLayerCreate();
        contentLayer.style.width = "100%";
        contentLayer.style.height = "100%";
        contentLayer.style.overflow = "scroll";

        this._contentView = new MUIView();
        this._contentView.initWithLayer(contentLayer, this);
        super.addSubview(this._contentView);

        var instance = this;
        contentLayer.onscroll = function (e) {

            instance._scrollEventCallback.call(instance, e);
        };
        
        contentLayer.onwheel = function (e) {

            instance._scrollEventCallback.call(instance, e);
        };
    }

    private _scrollEventCallback(event)
    {
        if (this.scrolling == false)
        {
            this.scrolling = true;
            this.didStartScroll();
        }

        if (this._scrollTimer != null) this._scrollTimer.invalidate();
        this._scrollTimer = MIOTimer.scheduledTimerWithTimeInterval(150, false, this, this._scrollEventStopCallback);                

        var offsetY = this.contentOffset.y;
        var deltaY = 0;
        if (offsetY < this._lastOffsetY)
            deltaY = offsetY - this._lastOffsetY;
        else if (offsetY > this._lastOffsetY)
            deltaY = this._lastOffsetY + offsetY;

        this.didScroll(0, deltaY);
        this._lastOffsetY = this.contentOffset.y;

        if (this.delegate != null && typeof this.delegate.scrollViewDidScroll === "function")
            this.delegate.scrollViewDidScroll.call(this.delegate, this);        
    }

    private _scrollEventStopCallback(timer)
    {
        this.scrolling = false;

        this.didStopScroll();
    }

    protected didStartScroll()
    {
        console.log("START SCROLL");
    }

    protected didScroll(deltaX, deltaY)
    {
        console.log("DID SCROLL");
    }

    protected didStopScroll()
    {
        console.log("STOP SCROLL");        
    }

    addSubview(view, index?){
        this._contentView.addSubview(view, index);
    }

    removeFromSuperview(){
        this._contentView.removeFromSuperview();
    }

    public setShowsVerticalScrollIndicator(value:boolean)
    {
        if (value == this._showsVerticalScrollIndicator) return;

        this._showsVerticalScrollIndicator = value;
        
        if (value == false) {
            this._contentView.layer.style.paddingRight = "20px";
        }
        else {
            this._contentView.layer.style.paddingRight = "";
        }
    }

    get contentOffset()
    {
        var p = new MIOPoint(this._contentView.layer.scrollLeft, this._contentView.layer.scrollTop);
        return p;
    }

    scrollToTop(animate?)
    {
        // if (true)
        //     this.layer.style.transition = "scrollTop 0.25s";

        this._contentView.layer.scrollTop = 0;
    }

    scrollToBottom(animate?)
    {
        // if (true)
        //     this.layer.style.transition = "scrollTop 0.25s";

        this._contentView.layer.scrollTop = this.layer.scrollHeight;
    }

    scrollToPoint(x, y, animate?)
    {
        this._contentView.layer.scrollTop = y;
        this._lastOffsetY = y;
    }

    scrollRectToVisible(rect, animate?)
    {
        //TODO: Implement this
    }
}