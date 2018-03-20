import { MUIView } from "./MUIView";
import { MUIWebApplication } from "./MUIWebApplication";

/**
 * Created by godshadow on 5/5/16.
 */

export class MUIMenuItem extends MUIView
{
    checked = false;
    title = null;

    private _titleLayer = null;

    target = null;
    action = null;

/*  public static itemWithLayer(layer)
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
    }*/

    public static itemWithTitle(title)
    {
        var mi = new MUIMenuItem();
        mi.initWithTitle(title);

        return mi;
    }

    initWithTitle(title)
    {
        this.init();
        this._setupLayer();

        this.layer.style.width = "100%";
        this.layer.style.height = "";

        this._titleLayer = document.createElement("span");
        this._titleLayer.classList.add("menu_item");
        this._titleLayer.style.color = "inherit";
        this._titleLayer.innerHTML = title;
        this.layer.appendChild(this._titleLayer);

        this.title = title;
    }

    _setupLayer()
    {
        var instance = this;
        this.layer.onmouseenter = function (e) {

            e.stopPropagation();
            instance.layer.classList.add("menu_item_on_hover");
        };

        this.layer.onmouseleave = function (e) {

            e.stopPropagation();
            instance.layer.classList.remove("menu_item_on_hover");
        };

        this.layer.ontouchend = function(e)
        {
            e.stopPropagation();
            if (instance.action != null && instance.target != null) {

                instance.layer.classList.remove("menu_item_on_hover");
                instance.action.call(instance.target, instance);
            }
        }

        this.layer.onmouseup = function(e)
        {
            e.stopPropagation();
            if (instance.action != null && instance.target != null) {

                instance.layer.classList.remove("menu_item_on_hover");
                instance.action.call(instance.target, instance);
            }
        }

    }

    getWidth()
    {
        //return this.layer.style.innerWidth;
        return this._titleLayer.getBoundingClientRect().width;
    }

    getHeight()
    {
        return this.layer.getBoundingClientRect().height;
    }
}

export class MUIMenu extends MUIView
{
    items = [];
    private _isVisible = false;
    private _updateWidth = true;

    target = null;
    action = null;

    private _menuLayer = null;

    init()
    {
        super.init();
        this._setupLayer();
    }

  /*  initWithLayer(layer, options?)
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

        this._setupLayer();
        this.setAlpha(0);
    }*/

    _setupLayer()
    {
        this.layer.classList.add("menu");
        this.layer.style.zIndex = 100;
    }

    private _addMenuItem(menuItem)
    {
        this.items.push(menuItem);
    }

    addMenuItem(menuItem)
    {
        menuItem.action = this._menuItemDidClick;
        menuItem.target = this;
        this.items.push(menuItem);
        this.addSubview(menuItem);
        this._updateWidth = true;
    }

    removeMenuItem(menuItem)
    {
        //TODO: Implement this!!!
    }

    private _menuItemDidClick(menuItem)
    {
        if (this.action != null && this.target != null) {

            var index = this.items.indexOf(menuItem);
            this.action.call(this.target, this, index);
        }

        this.hide();
    }

    showFromControl(control)
    {
        this._isVisible = true;
        MUIWebApplication.sharedInstance().showMenuFromControl(control, this);
    }

    hide()
    {
        this._isVisible = false;
        MUIWebApplication.sharedInstance().hideMenu();
    }

    get isVisible()
    {
        return this._isVisible;
    }

    layout()
    {
        if (this._updateWidth == true)
        {
            var width = 0;
            var y = 5;
            for(var index = 0; index < this.items.length; index++)
            {
                var item = this.items[index];
                item.setX(0);
                item.setY(y);

                var w = item.getWidth();
                if (w > width)
                    width = w;
                y += item.getHeight();

            }
        }

        if (width < 40) width = 40;
        this.setWidth(width + 10);
        this.setHeight(y + 5);
    }
}