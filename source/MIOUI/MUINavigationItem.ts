import { MIOObject } from "../MIOFoundation";
import { MUIView, MUILayerSearchElementByAttribute } from "./MUIView";
import { MUIButton } from "./MUIButton";

export class MUINavigationItem extends MIOObject
{    
    backBarButtonItem:MUIButton = null;
    titleView:MUIView = null;
    title:string = null;

    private leftView:MUIView = null;    
    private rightView:MUIView = null;
    
    initWithLayer(layer){
        if (layer.childNodes.length > 0) {
            for (let index = 0; index < layer.childNodes.length; index++) {
                let subLayer = layer.childNodes[index];
        
                if (subLayer.tagName != "DIV") continue;
    
                if (subLayer.getAttribute("data-nav-item-left") != null) {
                    let v:MUIView = new MUIView();
                    v.initWithLayer(subLayer, this);
                    this.leftView = v;
                }
                else if (subLayer.getAttribute("data-nav-item-center") != null) {
                    let v:MUIView = new MUIView();
                    v.initWithLayer(subLayer, this);
                    this.titleView = v;
                }
                else if (subLayer.getAttribute("data-nav-item-right") != null) {
                    let v:MUIView = new MUIView();
                    v.initWithLayer(subLayer, this);
                    this.rightView = v;
                }
            }

            let backButtonLayer = MUILayerSearchElementByAttribute(layer, "data-nav-item-back");
            if (backButtonLayer != null) {
                this.backBarButtonItem = new MUIButton();
                this.backBarButtonItem.initWithLayer(backButtonLayer, this);
            }
        }
    }
}

export function MUINavItemSearchInLayer(layer)
{
    if (layer.childNodes.length > 0) {
        for (let index = 0; index < layer.childNodes.length; index++) {
            let subLayer = layer.childNodes[index];
    
            if (subLayer.tagName != "DIV") continue;

            if (subLayer.getAttribute("data-nav-item") != null) {
                let ni = new MUINavigationItem();
                ni.initWithLayer(subLayer);  
                
                // Check for tittle if center view doesn't exists
                if (ni.titleView == null) {
                    let title = subLayer.getAttribute("data-nav-item-title");
                    if (title != null) ni.title = title;
                }

                return ni;             
            }
        }
    }

    return null;
 }
