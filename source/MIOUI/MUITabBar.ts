/**
 * Created by godshadow on 25/08/16.
 */

/// <reference path="MUIView.ts" />
/// <reference path="MUIButton.ts" />


class MUITabBarItem extends MUIButton
{
    // TODO: Add more extra features. Comming soon
}

class MUITabBar extends MUIView
{
    items = [];    
    selectedTabBarItemIndex = -1;

    private _itemsByIdentifier = {};

    initWithLayer(layer, owner, options?)
    {
        super.initWithLayer(layer, owner, options);

        // Check for tab items
        var opts = {};
        var sp = layer.getAttribute("data-status-style-prefix");
        if (sp != null) opts["status-style-prefix"] = sp;
        
        for (var index = 0; index < this.layer.childNodes.length; index++)
        {
            var tabItemLayer = this.layer.childNodes[index];
            if (tabItemLayer.tagName == "DIV")
            {
                var ti = new MUITabBarItem();
                ti.initWithLayer(tabItemLayer, owner, opts);
                ti.type = MUIButtonType.PushIn;                
                this._addTabBarItem(ti);
                MUIOutletRegister(owner, ti.layerID, ti);
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
            if (item.hidden == true) continue;
            item.setFrame(MIOFrame.frameWithRect(x, 0, w, this.getHeight()));
            x += w;
        }
    }
}