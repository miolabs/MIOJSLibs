import { MUIView } from "./MUIView";
import { UIEdgeInsets } from "./UIEdgeInsets";
import { MIOPoint } from "../MIOFoundation";


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
}