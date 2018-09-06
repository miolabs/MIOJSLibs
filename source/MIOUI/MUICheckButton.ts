import { MUIControl } from "./MUIControl";
import { MUICoreLayerAddStyle, MUICoreLayerRemoveStyle } from "./MIOUI_CoreLayer";

/**
 * Created by godshadow on 12/3/16.
 */

export class MUICheckButton extends MUIControl
{
    target = null;
    action = null;    

    init(){
        super.init();
        MUICoreLayerAddStyle(this.layer, "checkbox"); 
    }

    initWithLayer(layer, owner, options?){
        super.initWithLayer(layer, owner, options);        
        this.layer.addEventListener("click", this._on_click.bind(this), false);
    }

    private _on_click(ev:Event){
        if (this.enabled) {
            this.toggleValue();
        }
    }

    setOnChangeValue(target, action){
        this.target = target;
        this.action = action;
    }

    private _on = false;
    get on():boolean{
        return this._on;
    }

    set on(value:boolean){
        this.setOn(value);
    }    

    setOn(on){
        this._on = on;
        if (on == true){
            MUICoreLayerAddStyle(this.layer, "selected");
        }
        else {
            MUICoreLayerRemoveStyle(this.layer, "selected");            
        }
    }

    toggleValue(){
        this.setOn(!this._on);

        if (this.target != null && this.action != null)
            this.action.call(this.target, this, this._on);
    }
}
