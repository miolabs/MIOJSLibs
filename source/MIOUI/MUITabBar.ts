/**
 * Created by godshadow on 25/08/16.
 */

/// <reference path="MUIView.ts" />
/// <reference path="MUIButton.ts" />


class MUITabBarItem extends MUIView
{
    private _titleStatusStyle = null;
    private _titleLayer = null;

    private _imageStatusStyle = null;
    private _imageLayer = null;

    isSelected = false;

    initWithLayer(layer, options?)
    {
        super.initWithLayer(layer, options);

        if (this.layer.childNodes.length < 2)
            throw new Error("Tab bar item broken!");

        var count = 0;
        for (var index = 0; index < this.layer.childNodes.length; index++)
        {
            var l = this.layer.childNodes[index];
            if (l.tagName == "DIV") {
                count++;
                if (count == 1) {
                    this._imageLayer = l;
                    this._imageStatusStyle = l.getAttribute("data-status-style");
                }
                else if (count == 2) {
                    this._titleLayer = l;
                    this._titleStatusStyle = l.getAttribute("data-status-style");
                    break;
                }
            }
        }
    }

    setSelected(value)
    {
        if (value == true) {
            this._imageLayer.classList.remove(this._imageStatusStyle + "_off");
            this._imageLayer.classList.add(this._imageStatusStyle + "_on");
            this._titleLayer.classList.remove(this._titleStatusStyle + "_off");
            this._titleLayer.classList.add(this._titleStatusStyle + "_on");
        }
        else {
            this._imageLayer.classList.remove(this._imageStatusStyle + "_on");
            this._imageLayer.classList.add(this._imageStatusStyle + "_off");
            this._titleLayer.classList.remove(this._titleStatusStyle + "_on");
            this._titleLayer.classList.add(this._titleStatusStyle + "_off");
        }

        this.isSelected = value;
    }
}

class MUITabBar extends MUIView
{
    items = [];
    selectedTabBarItemIndex = -1;

    initWithLayer(layer, options)
    {
        super.initWithLayer(layer, options);

        // TODO: change to buttons
        // Check for tab items
        for (var index = 0; index < this.layer.childNodes.length; index++)
        {
            var tabItemLayer = this.layer.childNodes[index];
            if (tabItemLayer.tagName == "DIV")
            {
                var ti = new MUITabBarItem();
                ti.initWithLayer(tabItemLayer);
                this._addTabBarItem(ti);
            }
        }

        if (this.items.length > 0)
            this.selectTabBarItemAtIndex(0);
    }

    private _addTabBarItem(item)
    {
        this.items.push(item);

        var instance = this;
        item.layer.onclick = function () {

            instance.selectTabBarItem.call(instance, item);
        };
    }

    addTabBarItem(item)
    {
        this._addTabBarItem(item);
        this.addSubview(item);
    }

    selectTabBarItem(item)
    {
        var index = this.items.indexOf(item);
        if (index == this.selectedTabBarItemIndex)
            return;

        if (this.selectedTabBarItemIndex > -1)
        {
            // Deselect
            var lastItem = this.items[this.selectedTabBarItemIndex];
            lastItem.setSelected(false);
        }

        item.setSelected(true);

        this.willChangeValue("selectedTabBarItemIndex");
        this.selectedTabBarItemIndex = index;
        this.didChangeValue("selectedTabBarItemIndex");
    }

    selectTabBarItemAtIndex(index)
    {
        var item = this.items[index];
        this.selectTabBarItem(item);
    }

    layout()
    {
        var len = this.items.length;
        var width = this.getWidth();
        var w = width / len;
        var x = 0;

        for (var index = 0; index < this.items.length; index++)
        {
            var item = this.items[index];
            item.setFrame(MIOFrame.frameWithRect(x, 0, w, this.getHeight()));
            x += w;
        }
    }
}