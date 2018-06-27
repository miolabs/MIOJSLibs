import { MUIControl } from "./MUIControl";
import { MUILayerGetFirstElementWithTag } from "./MUIView";

/**
 * Created by godshadow on 15/3/16.
 */


export class MUITextArea extends MUIControl
{
    private textareaLayer = null;

    textChangeTarget = null;
    textChangeAction = null;

    initWithLayer(layer, owner, options?){
        super.initWithLayer(layer, owner, options);

        this.textareaLayer = MUILayerGetFirstElementWithTag(this.layer, "TEXTAREA");

        this.setupLayer();
    }

    private setupLayer(){

        if (this.textareaLayer == null) {

            this.textareaLayer = document.createElement("textarea");
            this.textareaLayer.style.width = "98%";
            this.textareaLayer.style.height = "90%";
            //this.textareaLayer.backgroundColor = "transparent";
            this.textareaLayer.style.resize = "none";
            this.textareaLayer.style.borderStyle = "none";
            this.textareaLayer.style.borderColor = "transparent";
            this.textareaLayer.style.outline = "none";
            this.textareaLayer.overflow = "auto";
            this.layer.appendChild(this.textareaLayer);
        }
    }

    get text(){
        return this.getText();
    }

    set text(text){
        this.setText(text);
    }

    setText(text){
        if (text == null) this.textareaLayer.value = "";
        else this.textareaLayer.value = text;        
    }

    getText(){
        return this.textareaLayer.value;        
    }

    setEditMode(value){
        this.textareaLayer.disabled = !value;
    }

    setOnChangeText(target, action){
        this.textChangeTarget = target;
        this.textChangeAction = action;
        var instance = this;

        this.textareaLayer.addEventListener("input", function(e){
            if (instance.enabled) {
                let value = instance.textareaLayer.value;
                instance.textChangeAction.call(target, instance, value);
            }
        });
    }
}
