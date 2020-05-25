import { MUIView } from "./MUIView";
import { UIEdgeInsets } from "./UIEdgeInsets";


export class UIScrollView extends MUIView 
{
    private _contentInset = UIEdgeInsets.zero();       
    get contentInset():UIEdgeInsets { return this._contentInset; }
    set contentInset(value:UIEdgeInsets) {
        this._contentInset = value != null ? value : UIEdgeInsets.zero();
        // Apply padding
        this.layer.style.padding = value.top + "px " + value.right + "px " + value.bottom + "px " + value.left + "px";
    }
}