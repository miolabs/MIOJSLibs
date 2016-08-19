/**
 * Created by godshadow on 5/5/16.
 */

    /// <reference path="MIOView.ts" />

class MIOMenuItem extends MIOView
{
    checked = false;
    title = null;

    parent = null;

    private _titleLayer = null;

    constructor(layerID?)
    {
        super(layerID == null ? MIOViewGetNextLayerID("mio_menu_item") : layerID);
    }

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

        var instance = this;
        this.layer.onclick = function()
        {
            if (instance.parent != null) {
                var index = instance.parent.items.indexOf(instance);
                instance.parent.action.call(instance.parent.target, instance, index);
            }
        }
    }

    public static itemWithTitle(title)
    {
        var mi = new MIOMenuItem();
        mi.initWithTitle(title);

        return mi;
    }

    initWithTitle(title)
    {
        this.layer = document.createElement("li");

        this._titleLayer = document.createElement("span");
        this._titleLayer.classList.add("menu_item");
        this._titleLayer.innerHTML = title;
        this.layer.appendChild(this._titleLayer);

        this.title = title;
    }
}

class MIOMenu extends MIOView
{
    items = [];
    private _isVisible = false;
    private _updateWidth = true;

    target = null;
    action = null;

    constructor(layerID?)
    {
        super(layerID == null ? MIOViewGetNextLayerID("mio_menu") : layerID);
    }

    init()
    {
        this.layer = document.createElement("ul");
        //this.layer.classList.add("menu");
        //this.layer.style.zIndex = 100;
        //this.setHidden(true);
    }

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
                    item.parent = this;

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
        this.items.push(menuItem);
    }

    addMenuItem(menuItem)
    {
        this.items.push(menuItem);
        this.layer.appendChild(menuItem.layer);
        this._updateWidth = true;
    }

    removeMenuItem(menuItem)
    {

    }

    show()
    {
        this._isVisible = true;
        this.setHidden(false);
        this.layout();
    }

    hide()
    {
        this._isVisible = false;
        this.setHidden(true);
    }

    toggle()
    {
        if (this._isVisible)
            this.hide();
        else
            this.show();
    }

    layout()
    {
        if (this._isVisible == false)
            return;

        if (this._updateWidth == true)
        {
            var maxWidth = 0;
            for(var index = 0; index < this.items.length; index++)
            {
                var item = this.items[index];
                var w = item.getWidth();
                if (w > maxWidth)
                    maxWidth = w;
            }
        }
    }
}