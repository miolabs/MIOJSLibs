import { MUIControl } from "./MUIControl";
import { MUIButton, MUIButtonType } from "./MUIButton";
import { MUIOutletRegister } from "./MIOUI_Core";

/**
 * Created by godshadow on 29/08/16.
 */

export class MUISegmentedControl extends MUIControl
{
    segmentedItems = [];
    selectedSegmentedIndex = -1;

    initWithLayer(layer, owner, options?)
    {
        super.initWithLayer(layer, owner, options);

        for (let index = 0; index < this.layer.childNodes.length; index++){
            let itemLayer = this.layer.childNodes[index];
            if (itemLayer.tagName == "DIV"){
                let si = new MUIButton();
                si.initWithLayer(itemLayer, owner);
                si.type = MUIButtonType.PushIn;
                this._addSegmentedItem(si);
                MUIOutletRegister(owner, si.layerID, si);
            }
        }

        if (this.segmentedItems.length > 0){
            let item = this.segmentedItems[0];
            item.setSelected(true);
            this.selectedSegmentedIndex = 0;
        }
    }

    private _addSegmentedItem(item){
        this.segmentedItems.push(item);
        item.setAction(this, this._didClickSegmentedButton);
    }

    private _didClickSegmentedButton(button){
        let index = this.segmentedItems.indexOf(button);
        this.selectSegmentedAtIndex(index);

        if (this.mouseOutTarget != null)
            this.mouseOutAction.call(this.mouseOutTarget, this, index);
    }

    setAction(target, action){
        this.mouseOutTarget = target;
        this.mouseOutAction = action;
    }

    selectSegmentedAtIndex(index){
        if (this.selectedSegmentedIndex == index)
            return;

        if (this.selectedSegmentedIndex > -1){
            let lastItem = this.segmentedItems[this.selectedSegmentedIndex];
            lastItem.setSelected(false);
        }

        this.selectedSegmentedIndex = index;
        
        let item = this.segmentedItems[this.selectedSegmentedIndex];
        item.setSelected(true);
    }
}