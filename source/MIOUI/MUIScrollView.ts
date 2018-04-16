import { MUIView } from "./MUIView";
import { MIOTimer, MIOPoint, MIORect, MIOSize, MIOLog } from "../MIOFoundation";
import { MUICoreLayerCreate, MUICoreLayerRemoveSublayer, MUICoreLayerAddSublayer } from "./MIOUI_CoreLayer";

/**
 * Created by godshadow on 01/09/16.
 */


export class MUIScrollView extends MUIView {
    pagingEnabled = false;
    delegate = null;
    scrolling = false;

    private _showsVerticalScrollIndicator: boolean = true;
    set showsVerticalScrollIndicator(value: boolean) { this.setShowsVerticalScrollIndicator(value); }
    get showsVerticalScrollIndicator(): boolean { return this._showsVerticalScrollIndicator; }

    private _scrollEnable = true;
    set scrollEnable(value: boolean) { this.setScrollEnable(value); }
    get scrollEnable(): boolean { return this._scrollEnable; }

    private scrollTimer = null;
    private lastOffsetY = 0;

    protected contentView:MUIView = null;

    init() {
        super.init();
        this.setupLayer();
    }

    initWithLayer(layer, owner, options?) {
        super.initWithLayer(layer, owner, options);
        this.setupLayer();
    }

    private setupLayer() {
        this.layer.style.overflow = "scroll";

        var contentLayer = MUICoreLayerCreate();
        contentLayer.style.position = "absolute";
        contentLayer.style.width = "100%";
        contentLayer.style.height = "100%";
        contentLayer.style.overflow = "hidden";

        this.contentView = new MUIView();
        this.contentView.initWithLayer(contentLayer, this);
        super.addSubview(this.contentView);

        var instance = this;
        this.contentView.layer.onwheel = function (e) {
             instance.scrollEventCallback.call(instance);
        };
        
        this.contentView.layer.onscroll = function (e) {
            if (e.target === instance.contentView.layer) instance.scrollEventCallback.call(instance);
        };        

        // FIX: Scroll event don't get fire when you scroll with a scrollbar because the system thinks that
        //      has to take care by himself to scroll a "prerender" page so if you have a dynamic page that 
        //      has to be notify when the user scrolls to load more content, you're out of luck. You code doesn't get call.
        //      The onwheel event, instead, fire an event becuase it's a hardware thing, not like the scrollbar...
        //
        // NOTE: Really, who the hell make this kind of crap implementation in the html???

        /*
        var options = {
            root: contentLayer,
            rootMargin: '0px',
            threshold: 0
        }

        var instance = this;
        this.io = new IntersectionObserver(function(entries){
            instance.scrollEventCallback();
        });     */   
    }

    private io:IntersectionObserver = null;
    private ioMarkers = [];
    private createIntersectionObserverMarkers(height){
        
        // I use layer (html divs) instead of view because I don't need al the wrapper code around. So it's ligther
        for (let index = 0; index < this.ioMarkers.length; index++){
            let marker = this.ioMarkers[index];
            MUICoreLayerRemoveSublayer(this.contentView.layer, marker);
            this.io.unobserve(marker);
        }
        this.ioMarkers = [];
        
        let viewportHeight = this.getHeight() || 0;
        if (viewportHeight == 0) return;
        if (height < viewportHeight) return; // We don't need markers
        
        let heightDivision = viewportHeight / 4;
        let count = (height / heightDivision) | 0; // convert to int -> value OR 0
        for(let index = 0; index < count; index++){
            let marker = MUICoreLayerCreate();
            marker.style.top = ((index + 1) * heightDivision) + "px";
            marker.style.height = "1px";
            marker.style.width = "100%";
            //marker.style.background = "rgb(255, 0, 0)";
            //marker.style.zIndex = "1000";
            this.ioMarkers.push(marker);
            MUICoreLayerAddSublayer(this.contentView.layer, marker);
            this.io.observe(marker);
        }
    }

    private scrollEventCallback() {

        console.log("scroll callback");

        this.setNeedsDisplay()

        if (this.scrolling == false) {
            this.scrolling = true;
            this.didStartScroll();
        }

        if (this.scrollTimer != null) this.scrollTimer.invalidate();
        this.scrollTimer = MIOTimer.scheduledTimerWithTimeInterval(150, false, this, this.scrollEventStopCallback);

        var offsetY = this.contentOffset.y;
        var deltaY = 0;
        if (offsetY < this.lastOffsetY)
            deltaY = offsetY - this.lastOffsetY;
        else if (offsetY > this.lastOffsetY)
            deltaY = this.lastOffsetY + offsetY;

        //console.log("Content Offset y: " + offsetY + " - delta y: " + deltaY);

        this.didScroll(0, deltaY);
        this.lastOffsetY = this.contentOffset.y;

        if (this.delegate != null && typeof this.delegate.scrollViewDidScroll === "function")
            this.delegate.scrollViewDidScroll.call(this.delegate, this);
    }

    private scrollEventStopCallback(timer) {
        this.scrolling = false;

        this.didStopScroll();
    }

    protected didStartScroll() {
        //console.log("START SCROLL");
    }

    protected didScroll(deltaX, deltaY) {
        //console.log("DID SCROLL");
    }

    protected didStopScroll() {
        //console.log("STOP SCROLL");
    }

    public setScrollEnable(value: boolean) {

        if (this._scrollEnable == value) return;
        this._scrollEnable = value;


        if (value == true) {
            this.contentView.layer.style.overflow = "scroll";
        }
        else {
            this.contentView.layer.style.overflow = "hidden";
        }
    }

    public setShowsVerticalScrollIndicator(value: boolean) {
        if (value == this._showsVerticalScrollIndicator) return;

        this._showsVerticalScrollIndicator = value;

        if (value == false) {
            this.layer.style.paddingRight = "20px";
        }
        else {
            this.layer.style.paddingRight = "";
        }
    }

    set contentOffset(point: MIOPoint) {
        //TODO:
    }

    get contentOffset(): MIOPoint {
        var p = new MIOPoint(this.layer.scrollLeft, this.layer.scrollTop);
        return p;
    }

    get bounds():MIORect{
        let p = this.contentOffset;
        return MIORect.rectWithValues(p.x, p.y, this.getWidth(), this.getHeight());
    }

    addSubview(view:MUIView, index?) {
        this.contentView.addSubview(view, index);
    }

    set contentSize(size: MIOSize) {
        if (size.width > 0) {
            this.contentView.setWidth(size.width);
        }
        if (size.height > 0) {
            this.contentView.setHeight(size.height);
            // create markers for intersection observer (see fix note below)
            //this.createIntersectionObserverMarkers(size.height);
        }
    }

    layoutSubviews() {
        this.contentView.layoutSubviews();
    }

    scrollToTop(animate?) {
        // if (true)
        //     this.layer.style.transition = "scrollTop 0.25s";

        this.layer.scrollTop = 0;
    }

    scrollToBottom(animate?) {
        // if (true)
        //     this.layer.style.transition = "scrollTop 0.25s";

        this.layer.scrollTop = this.layer.scrollHeight;
    }

    scrollToPoint(x, y, animate?) {
        this.layer.scrollTop = y;
        this.lastOffsetY = y;
    }

    scrollRectToVisible(rect, animate?) {
        //TODO: Implement this
    }
}