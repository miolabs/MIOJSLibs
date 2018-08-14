import { MUIView } from "./MUIView";
import { MIOTimer, MIOPoint, MIORect, MIOSize, MIOLog } from "../MIOFoundation";
import { MUICoreLayerCreate, MUICoreLayerRemoveSublayer, MUICoreLayerAddSublayer, MUICoreLayerAddStyle } from "./MIOUI_CoreLayer";
import { MIOCoreDeviceOSString } from "../MIOCore/platform";

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
        if (MIOCoreDeviceOSString() == "ios") this.layer.style["-webkit-overflow-scrolling"] = "touch"; 

        let contentLayer = MUICoreLayerCreate();
        MUICoreLayerAddStyle(contentLayer, "content-view");
        // contentLayer.style.position = "absolute";
        // contentLayer.style.width = "100%";
        // contentLayer.style.height = "100%";
        // contentLayer.style.overflow = "hidden";

        this.contentView = new MUIView();
        this.contentView.initWithLayer(contentLayer, this);
        super.addSubview(this.contentView);
        
        this.contentView.layer.addEventListener("wheel", this.scrollEventCallback.bind(this), true);
        this.layer.addEventListener("scroll", this.scrollEventCallback.bind(this), true);

        // if (MIOCoreDeviceOSString() == 'ios'){
        //     this.contentView.layer.addEventListener("touchstart", function(e){

        //     }, false);
        // }

        // FIX: Scroll event don't get fire when you scroll with a scrollbar because the system thinks that
        //      has to take care by himself to scroll a "prerender" page so if you have a dynamic page that 
        //      has to be notify when the user scrolls to load more content, you're out of luck. You code doesn't get call.
        //      The onwheel event, instead, fire an event becuase it's a hardware thing, not like the scrollbar...
        //
        // NOTE: Really, who the hell make this kind of crap implementation in the html???

    }

    private scrollEventCallback() {

        let offsetY = this.contentOffset.y;
        let deltaY = 0;
        if (offsetY < this.lastOffsetY)
            deltaY = offsetY - this.lastOffsetY;
        else if (offsetY > this.lastOffsetY)
            deltaY = this.lastOffsetY + offsetY;
        else 
            return;

        console.log("Content Offset y: " + offsetY + " - delta y: " + deltaY);

        this.setNeedsDisplay();

        if (this.scrolling == false) {
            this.scrolling = true;
            this.didStartScroll();
        }

        if (this.scrollTimer != null) this.scrollTimer.invalidate();
        this.scrollTimer = MIOTimer.scheduledTimerWithTimeInterval(150, false, this, this.scrollEventStopCallback);        

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
        if (point.x > 0) this.layer.scrollLeft = point.x;
        if (point.y > 0) this.layer.scrollTop = point.y;
    }

    get contentOffset(): MIOPoint {
        let p = new MIOPoint(this.layer.scrollLeft, this.layer.scrollTop);
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