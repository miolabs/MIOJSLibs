/**
 * Created by godshadow on 29/08/16.
 */

/// <reference path="MIOView.ts" />
/// <reference path="MIOButton.ts" />

class MIOSegmentedControl extends MIOView
{
    segmentedItems = [];

    initWithLayer(layer)
    {
        super.initWithLayer(layer);

        // Check for segmented items
        for (var index = 0; index < layer.childNodes.length; index++)
        {
            var itemLayer = layer.childNodes[index];
            if (itemLayer.tagName == "DIV")
            {
                var si = new MIOButton();
                si.initWithLayer(itemLayer, MIOButton.type);
                this._addSegmentedItem(si);
            }
        }
    }

    private _addSegmentedItem(item)
    {
        this.segmentedItems.push(item);

    }
}