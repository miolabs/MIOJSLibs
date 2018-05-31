import { MUIControl } from "./MUIControl";
import { MUILayerGetFirstElementWithTag } from "./MUIView";

/**
 * Created by godshadow on 12/3/16.
 */

export class MUISwitchButton extends MUIControl
{
    target = null;
    action = null;    

    private _inputLayer = null;
    private _labelLayer = null;

    initWithLayer(layer, owner, options?){
        super.initWithLayer(layer, owner, options);

        this.layer.classList.add("switch_button");

        this._inputLayer = MUILayerGetFirstElementWithTag(this.layer, "INPUT");
        if (this._inputLayer == null) {
            this._inputLayer = document.createElement("input");
            this._inputLayer.setAttribute("type", "checkbox");
            this._inputLayer.setAttribute("id", this.layerID + "_input");
            this._inputLayer.classList.add("switch_button_input");
            layer.appendChild(this._inputLayer);
        }       

        // var div1 = document.createElement("div");
        // this.layer.appendChild(div1);

        // var div2 = document.createElement("div");
        // div1.appendChild(div2); 

/*
        this._labelLayer = MUILayerGetFirstElementWithTag(this.layer, "LABEL");
        if (this._labelLayer == null) {
            this._labelLayer = document.createElement("label");
            this._labelLayer.setAttribute("for", this.layerID + "_input");
            //this._labelLayer.classList.add("switch_button_label");
            layer.appendChild(this._labelLayer);
        }

        */

        var instance = this;
        this.layer.onclick = function() {

            if (instance.enabled) {
                instance._toggleValue.call(instance);
            }
        }
    }

    setOnChangeValue(target, action){
        this.target = target;
        this.action = action;
    }


    private _on = false;
    get on() {return this._on;}
    set on(value){this.setOn(value);}
    setOn(on){
        if (on == this.on) return;
        this._inputLayer.checked = on;
        this._on = on;
    }

    private _toggleValue(){
        this.on = !this.on;

        if (this.target != null && this.action != null)
            this.action.call(this.target, this, this.on);
    }
}
