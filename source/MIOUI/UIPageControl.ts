import { MUIControl } from "./MUIControl";
import { MUIButton } from "./MUIButton";
import { MUICoreLayerCreateWithStyle, MUICoreLayerCreateFromLayer } from "./MIOUI_CoreLayer";

/**
 * Created by godshadow on 31/08/16.
 */

export class UIPageControl extends MUIControl {

    hidesForSinglePage = false;

    initWithLayer(layer, owner, options?){
        super.initWithLayer(layer, options);

        // Check for page items
        for (let index = 0; index < this.layer.childNodes.length; index++){
            let itemLayer = this.layer.childNodes[index];
            if (itemLayer.tagName == "DIV"){
                this.addPrototype(itemLayer);
            }
        }

        // Remove any div inside to clean up
        this.layer.innerHTML = "";
        if (this.dotLayer == null) this.dotLayer = MUICoreLayerCreateWithStyle("dot");
        this.updateHiddenStatus();
    }

    private dotLayer = null;
    private addPrototype(layer){
        this.dotLayer = layer;
    }

    private updateHiddenStatus(){
       this.hidden =  (this.hidesForSinglePage == true && this.dotButtons.length < 2) ? true : false;
    }

    protected dotButtons:MUIButton[] = [];
    set numberOfPages(count:number){
        
        // Remove the view and clear the array
        for (let dot of this.dotButtons){
            dot.removeFromSuperview();
        }
        this.dotButtons = [];

        // Setup the dot buttons
        for (let index = 0; index < count; index++){            
            let dot = new MUIButton();
            dot.initWithLayer(MUICoreLayerCreateFromLayer(this.dotLayer), null);
            this.dotButtons.push(dot);
            this.addSubview(dot);    
        }

        if (this.dotButtons.length > 0) this.currentPage = 0;
        this.updateHiddenStatus();
    }

    private _currentPage = -1;
    setCurrentPage(index:number){
        if ( this.dotButtons.length == 0 ) return;

        if (this._currentPage == index) return;

        if (this._currentPage > -1){
            let item = this.dotButtons[this._currentPage];
            item.setSelected(false);
        }

        let i = this.dotButtons[index];
        i.setSelected(true);

        this._currentPage = index;
    }

    set currentPage(index:number){
        this.setCurrentPage(index);
    }

    get currentPage(){
        return this._currentPage;
    }

}