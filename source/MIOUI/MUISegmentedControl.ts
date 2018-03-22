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

        // Check for segmented items
        var opts = {};
        var sp = layer.getAttribute("data-status-style-prefix");
        if (sp != null) opts["status-style-prefix"] = sp;

        for (var index = 0; index < this.layer.childNodes.length; index++)
        {
            var itemLayer = this.layer.childNodes[index];
            if (itemLayer.tagName == "DIV")
            {
                var si = new MUIButton();
                si.initWithLayer(itemLayer, owner, opts);
                si.type = MUIButtonType.PushIn;
                this._addSegmentedItem(si);
                MUIOutletRegister(owner, si.layerID, si);
            }
        }

        if (this.segmentedItems.length > 0)
        {
            var item = this.segmentedItems[0];
            item.setSelected(true);
            this.selectedSegmentedIndex = 0;
        }
    }

    private _addSegmentedItem(item)
    {
        this.segmentedItems.push(item);
        item.setAction(this, this._didClickSegmentedButton);
    }

    private _didClickSegmentedButton(button)
    {
        var index = this.segmentedItems.indexOf(button);
        this.selectSegmentedAtIndex(index);

        if (this.mouseOutTarget != null)
            this.mouseOutAction.call(this.mouseOutTarget, index);
    }

    setAction(target, action)
    {
        this.mouseOutTarget = target;
        this.mouseOutAction = action;
    }

    selectSegmentedAtIndex(index)
    {
        if (this.selectedSegmentedIndex == index)
            return;

        if (this.selectedSegmentedIndex > -1)
        {
            var lastItem = this.segmentedItems[this.selectedSegmentedIndex];
            lastItem.setSelected(false);
        }

        this.selectedSegmentedIndex = index;
        
        var item = this.segmentedItems[this.selectedSegmentedIndex];
        item.setSelected(true);
    }
}