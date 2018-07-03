import { MUIControl } from "./MUIControl";
import { MIOFormatter } from "../MIOFoundation";
import { MUILayerGetFirstElementWithTag } from "./MUIView";
import { MIOLocalizeString } from "../MIOCore";

/**
 * Created by godshadow on 12/3/16.
 */



export enum MUITextFieldType {
    NormalType,
    PasswordType,
    SearchType
}

export class MUITextField extends MUIControl
{
    placeHolder = null;
    private _inputLayer = null;
    type = MUITextFieldType.NormalType;

    textChangeTarget = null;
    textChangeAction = null;
    private _textChangeFn = null;

    enterPressTarget = null;
    enterPressAction = null;

    keyPressTarget   = null;
    keyPressAction   = null;

    formatter:MIOFormatter = null;

    init(){
        super.init();
        this._setupLayer();
    }

    initWithLayer(layer, owner, options?){
        super.initWithLayer(layer, owner, options);
        this._inputLayer = MUILayerGetFirstElementWithTag(this.layer, "INPUT");
        this._setupLayer();
    }

    private _setupLayer()
    {
        if (this._inputLayer == null)
        {
            this._inputLayer = document.createElement("input");

            if (this.type == MUITextFieldType.SearchType) {
                this._inputLayer.style.marginLeft = "10px";
                this._inputLayer.style.marginRight = "10px";
            }
            else {
                this._inputLayer.style.marginLeft = "5px";
                this._inputLayer.style.marginRight = "5px";
            }

            this._inputLayer.style.border = "0px";
            this._inputLayer.style.backgroundColor = "transparent";
            this._inputLayer.style.width = "100%";
            this._inputLayer.style.height = "100%";
            this._inputLayer.style.color = "inherit";
            this._inputLayer.style.fontSize = "inherit";
            this._inputLayer.style.fontFamily = "inherit";
            this._inputLayer.style.outline = "none";

            this.layer.appendChild(this._inputLayer);
        }

        const placeholderKey = this._inputLayer.getAttribute("data-placeholder");
        if (placeholderKey != null)
            this._inputLayer.setAttribute("placeholder", MIOLocalizeString(placeholderKey, placeholderKey));

        this._registerInputEvent();            
    }
    // layoutSubviews(){
    //     super.layoutSubviews();

        // var w = this.getWidth();
        // var h = this.getHeight();

        // this._inputLayer.style.marginLeft = "4px";
        // this._inputLayer.style.width = (w - 8) + "px";
        // this._inputLayer.style.marginTop = "4px";
        // this._inputLayer.style.height = (h - 8) + "px";
//    }

    setText(text){
        this.text = text;
    }

    set text(text){        
        let newValue = text != null ? text : "";        
        this._inputLayer.value = newValue;
    }

    get text(){
        return this._inputLayer.value;
    }

    setPlaceholderText(text)
    {
        this.placeHolder = text;
        this._inputLayer.setAttribute("placeholder", text);
    }

    setOnChangeText(target, action)
    {
        this.textChangeTarget = target;
        this.textChangeAction = action;
    }    

    private _registerInputEvent(){

        var instance = this;
        this._textChangeFn = function() {
            if (instance.enabled)
                instance._textDidChange.call(instance);
        }

        this.layer.addEventListener("input", this._textChangeFn);
    }

    private _unregisterInputEvent(){
        this.layer.removeEventListener("input", this._textChangeFn);
    }

    private _textDidChange(){

        if (this.enabled == false) return;

        // Check the formater
        var value = this._inputLayer.value;
        if (this.formatter == null) {
            this._textDidChangeDelegate(value);
        }
        else {
            var result, newStr;
            [result, newStr] = this.formatter.isPartialStringValid(value);

            this._unregisterInputEvent();
            this._inputLayer.value = newStr;
            this._registerInputEvent();

            if (result == true) {
                this._textDidChangeDelegate(value);
            }
        }
    }

    private _textDidChangeDelegate(value){
        if (this.textChangeAction != null && this.textChangeTarget != null)
            this.textChangeAction.call(this.textChangeTarget, this, value);
    }

    setOnEnterPress(target, action)
    {
        this.enterPressTarget = target;
        this.enterPressAction = action;
        var instance = this;

        this.layer.onkeyup = function(e)
        {
            if (instance.enabled) {
                if (e.keyCode == 13)
                    instance.enterPressAction.call(target, instance, instance._inputLayer.value);
            }
        }
    }

    setOnKeyPress(target, action)
    {
        this.keyPressTarget = target;
        this.keyPressAction = action;
        var instance = this;

        this.layer.onkeydown = function(e)
        {
            if (instance.enabled) {
                instance.keyPressAction.call(target, instance, e.keyCode);
            }
        }
    }

    private didEditingAction = null;
    private didEditingTarget = null;

    setOnDidEditing(target, action) {
        this.didEditingTarget = target;
        this.didEditingAction = action;
        let instance = this;

        this._inputLayer.onblur = function(e){
            if (instance.enabled) {
                instance.didEditingAction.call(target, instance, instance.text);
            }
        }
        
    }

    setTextRGBColor(r, g, b){
        let value = "rgb(" + r + ", " + g + ", " + b + ")";
        this._inputLayer.style.color = value;
    }

    set textColor(color){
        this._inputLayer.style.color = color;
    }

    get textColor(){
        let color = this._getValueFromCSSProperty("color");
        return color;        
    }

    setEnabled(value){
        super.setEnabled(value);
        this._inputLayer.readOnly = !value;
    }

    becomeFirstResponder(){
        this._inputLayer.focus();
    }

}

