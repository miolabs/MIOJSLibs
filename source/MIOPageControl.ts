/**
 * Created by godshadow on 31/08/16.
 */

/// <reference path="MIOButton.ts" />

class MIOPageControl extends MIOControl {

    numberOfPages = 0;

    private _items = [];
    private _currentPage = -1;

    protected _customizeLayerSetup() {

        super._customizeLayerSetup();

        // Check for page items
        for (var index = 0; index < this.layer.childNodes.length; index++)
        {
            var itemLayer = this.layer.childNodes[index];
            if (itemLayer.tagName == "DIV")
            {
                var i = new MIOButton();
                i.initWithLayer(itemLayer);
                this._items.push(i);
            }
        }

        if (this._items.length > 0)
            this.currentPage = 0;
    }

    set currentPage(index)
    {
        if (this._currentPage == index)
            return;

        if (this._currentPage > -1)
        {
            var i = this._items[this._currentPage];
            i.setSelected(false);
        }

        var i = this._items[index];
        i.setSelected(true);

        this._currentPage = index;
    }

    get currentPage()
    {
        return this._currentPage;
    }

}