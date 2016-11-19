/**
 * Created by godshadow on 29/08/16.
 */

/// <reference path="MIOControl.ts" />
/// <reference path="MIOButton.ts" />

class MIOSegmentedControl extends MIOControl
{
    segmentedItems = [];
    selectedSegmentedIndex = -1;

    protected _customizeLayerSetup()
    {
        super._customizeLayerSetup();

        // Check for segmented items
        for (var index = 0; index < this.layer.childNodes.length; index++)
        {
            var itemLayer = this.layer.childNodes[index];
            if (itemLayer.tagName == "DIV")
            {
                if (itemLayer.getAttribute("data-class") != "MIOButton")
                    continue;

                var si = new MIOButton();
                si.initWithLayer(itemLayer);
                si.type = MIOButtonType.PushIn;
                this._addSegmentedItem(si);
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
    }
}