
/**
 * Created by godshadow on 12/3/16.
 */

/// <reference path="MUIControl.ts" />

class MUISwitchButton extends MUIControl
{
    target = null;
    action = null;    
    on = false; //Off

    private _inputLayer = null;
    private _labelLayer = null;

    initWithLayer(layer, owner, options?)
    {
        super.initWithLayer(layer, owner, options);

        this.layer.classList.add("switch_button");

        this._inputLayer = MUILayerGetFirstElementWithTag(this.layer, "INPUT");
        if (this._inputLayer == null) {
            this._inputLayer = document.createElement("input");
            this._inputLayer.setAttribute("type", "checkbox");
            this._inputLayer.classList.add("switch_button_input_toggle");
            layer.appendChild(this._inputLayer);
        }        

        this._labelLayer = MUILayerGetFirstElementWithTag(this.layer, "LABEL");
        if (this._labelLayer == null) {
            this._labelLayer = document.createElement("label");
            this._labelLayer.setAttribute("for", "checkbox");
            this._labelLayer.classList.add("switch_button_label");
            layer.appendChild(this._labelLayer);
        }        

        var instance = this;
        this.layer.onclick = function() {

            if (instance.enabled) {
                instance.toggleValue.call(instance);
            }
        }
    }

    setOnChangeValue(target, action)
    {
        this.target = target;
        this.action = action;
    }

    setOn(on)
    {
        if (on == this.on) return;
        //this._inputLayer.checked = on;
        this.on = on;
    }

    toggleValue()
    {
        this.setOn(!this.on);

        if (this.target != null && this.action != null)
            this.action.call(this.target, this, this.on);
    }
}
