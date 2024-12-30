import { MUIView } from "./MUIView";
import { UIEdgeInsets } from "./UIEdgeInsets";
import { MIOPoint, MIOTimer } from "../MIOFoundation";

export interface UIScrollViewDelegate
{
    scrollViewWillBeginDragging?(scrollView: UIScrollView):void;
    scrollViewDidScroll?(scrollView:UIScrollView):void;
}

export class UIScrollView extends MUIView 
{
    private _contentInset = UIEdgeInsets.zero();       
    get contentInset():UIEdgeInsets { return this._contentInset; }
    set contentInset(value:UIEdgeInsets) {
        this._contentInset = value != null ? value : UIEdgeInsets.zero();
        // Apply padding
        this.layer.style.padding = value.top + "px " + value.right + "px " + value.bottom + "px " + value.left + "px";
    }

    set contentOffset(point: MIOPoint) {
        if (point.x > 0) this.layer.scrollLeft = point.x;
        if (point.y > 0) this.layer.scrollTop = point.y;
    }

    get contentOffset(): MIOPoint {
        let p = new MIOPoint(this.layer.scrollLeft, this.layer.scrollTop);
        return p;
    }

    protected _delegate:UIScrollViewDelegate|null = null;
    set delegate(value:UIScrollViewDelegate|null) { this.setDelegate(value); }
    get delegate():UIScrollViewDelegate|null { return this._delegate; }
    
    protected setDelegate(value:UIScrollViewDelegate|null) {
        this._delegate = value;

        if (value != null && ( typeof value.scrollViewDidScroll === "function" || typeof value.scrollViewWillBeginDragging === "function" ) ) {
            this.layer.addEventListener("wheel", this._scroll_event_callback.bind(this), true);
            this.layer.addEventListener("scroll", this._scroll_event_callback.bind(this), true);
        }
    }    

    private scroll_timer:MIOTimer|null = null;
    private last_offset_y = 0;
    private scrolling = false;

    private _scroll_event_callback() {
        if (typeof this.delegate?.scrollViewWillBeginDragging === "function") this.delegate?.scrollViewWillBeginDragging.call(this.delegate, this);
        let offset_y = this.contentOffset.y;
        let delta_y = 0;
        if (offset_y < this.last_offset_y)
            delta_y = offset_y - this.last_offset_y;
        else if (offset_y > this.last_offset_y)
            delta_y = this.last_offset_y + offset_y;
        else 
            return;

        //console.log("Content Offset y: " + offsetY + " - delta y: " + deltaY);

        this.setNeedsDisplay();

        if (this.scrolling == false) {
            this.scrolling = true;
            this.didStartScroll();
        }

        if (this.scroll_timer != null) this.scroll_timer.invalidate();
        this.scroll_timer = MIOTimer.scheduledTimerWithTimeInterval(150, false, this, this._scroll_event_stop_callback);

        this.didScroll(0, delta_y);
        this.last_offset_y = this.contentOffset.y;
        
        if (typeof this.delegate?.scrollViewDidScroll === "function") this.delegate?.scrollViewDidScroll.call(this.delegate, this);        
    }

    private _scroll_event_stop_callback(timer) {
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

}