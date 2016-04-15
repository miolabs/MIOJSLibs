/**
 * Created by godshadow on 12/3/16.
 */

    /// <reference path="MIOControl.ts" />

function MIOPopUpButtonFromElementID(view, elementID)
{
    var layer = MIOLayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;

    var button = new MIOPopUpButton();
    button.initWithLayer(layer);
    view._linkViewToSubview(button);

    return button;
}

class MIOPopUpButton extends MIOControl
{
    selectLayer = null;

    target = null;
    action = null;

    constructor()
    {
        super();
    }

    init()
    {
        super.init();
        this._setupLayer();
    }

    initWithLayer(layer)
    {
        super.initWithLayer(layer);
        this._setupLayer();
    }

    _setupLayer()
    {
        this.selectLayer = document.createElement("select");
        this.selectLayer.classList.add("pop_up_style");
        this.layer.appendChild(this.selectLayer);
    }

    setAllowMultipleSelection(value)
    {
        if (value == true)
            this.selectLayer.setAttribute("multiple", "multiple");
        else
            this.selectLayer.removeAttribute("multiple");
    }

    layout()
    {
        super.layout();

        var w = this.getWidth();
        var h = this.getHeight();

        this.selectLayer.style.marginLeft = "8px";
        this.selectLayer.style.width = (w - 16) + "px";
        this.selectLayer.style.marginTop = "4px";
        this.selectLayer.style.height = (h - 8) + "px";

        var color = this.getBackgroundColor();
        this.selectLayer.style.backgroundColor = color;
    }

    addItem(text, value?)
    {
        var option = document.createElement("option");
        option.innerHTML = text;
        if (value != null)
            option.value = value;
        this.selectLayer.appendChild(option);
    }

    addItems(items)
    {
        for (var count = 0; count < items.length; count++)
        {
            var text = items[count];
            this.addItem(text);
        }
    }

    removeAllItems()
    {
        var node = this.selectLayer;

        while (this.selectLayer.hasChildNodes()) {              // selected elem has children

            if (node.hasChildNodes()) {                // current node has children
                node = node.lastChild;                 // set current node to child
            }
            else {                                     // last child found
                node = node.parentNode;                // set node to parent
                node.removeChild(node.lastChild);      // remove last node
            }
        }
    }

    getItemAtIndex(index)
    {
        if (this.selectLayer.childNodes.length == 0)
            return null;

        var option = this.selectLayer.childNodes[index];
        return option.innerHTML;
    }

    getSelectedItem()
    {
        return this.selectLayer.value;
    }

    getSelectedItemText()
    {
        for (var index = 0; index < this.selectLayer.childNodes.length; index++)
        {
            var option = this.selectLayer.childNodes[index];
            if (this.selectLayer.value == option.value)
                return option.innerHTML;
        }
    }

    selectItem(item)
    {
        this.selectLayer.value = item;
    }

    setOnChangeAction(target, action)
    {
        this.target = target;
        this.action = action;
        var instance = this;

        this.selectLayer.onchange = function()
        {
            if (instance.enabled)
                instance.action.call(target, instance.selectLayer.value);
        }
    }
}
