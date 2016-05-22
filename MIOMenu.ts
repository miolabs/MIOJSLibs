/**
 * Created by godshadow on 5/5/16.
 */

    /// <reference path="MIOView.ts" />

class MIOMenuItem extends MIOView
{
    checked = false;
    title = null;

    public static itemWithLayer(layer)
    {
        var layerID = layer.getAttribute("id");
        var mi = new MIOMenuItem(layerID);
        mi.initWithLayer(layer);
        mi.title = layer.innerHTML;

        return mi;
    }

    initWithLayer(layer, options?)
    {
        super.initWithLayer(layer, options);

        this.layer.classList.add("menu_item");
    }

}

class MIOMenu extends MIOView
{
    private _items = [];
    private _isVisible = false;

    initWithLayer(layer, options?)
    {
        super.initWithLayer(layer, options);

        // Check if we have a menu
        if (this.layer.childNodes.length > 0)
        {
            for (var index = 0; index < this.layer.childNodes.length; index++)
            {
                var layer = this.layer.childNodes[index];
                if (layer.tagName == "DIV")
                {
                    var item = MIOMenuItem.itemWithLayer(layer);

                    this._linkViewToSubview(item);
                    this._addMenuItem(item);
                }
            }
        }

        this.layer.classList.add("menu");
        this.layer.style.zIndex = 100;
        this.setAlpha(0);
    }

    private _addMenuItem(menuItem)
    {
        this._items.push(menuItem);
    }

    addMenuItem(menuItem)
    {

    }

    removeMenuItem(menuItem)
    {

    }

    show()
    {
        this._isVisible = true;
        this.layer.style.zIndex = 100;
        this.setAlpha(1, true, 0.25);
    }

    hide()
    {
        this._isVisible = false;
        this.layer.style.zIndex = "auto";
        this.setAlpha(0, true, 0.25);
    }

    toggle()
    {
        if (this._isVisible)
            this.hide();
        else
            this.show();
    }
}