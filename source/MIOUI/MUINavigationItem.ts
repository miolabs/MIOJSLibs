import { MIOObject } from "../MIOFoundation";
import { MUIView } from "./MUIView";

export class MUINavigationItem extends MIOObject
{
    leftView:MUIView = null;
    titleView:MUIView = null;
    rightView:MUIView = null;
    title:string = null;

    initWithLayer(layer){
        if (layer.childNodes.length > 0) {
            for (var index = 0; index < layer.childNodes.length; index++) {
                var subLayer = layer.childNodes[index];
        
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
        }
    }
}

export function MUINavItemSearchInLayer(layer)
{
    if (layer.childNodes.length > 0) {
        for (var index = 0; index < layer.childNodes.length; index++) {
            var subLayer = layer.childNodes[index];
    
            if (subLayer.tagName != "DIV") continue;

            if (subLayer.getAttribute("data-nav-item") != null) {
                let ni:MUINavigationItem = new MUINavigationItem();
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
