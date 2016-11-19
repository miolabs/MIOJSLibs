/**
 * Created by godshadow on 2/5/16.
 */

    /// <reference path="MIOControl.ts" />

class MIOComboBox extends MIOControl
{
    private _selectLayer = null;

    target = null;
    action = null;

    protected _customizeLayerSetup()
    {
        super._customizeLayerSetup();

        this._selectLayer = MIOLayerGetFirstElementWithTag(this.layer, "SELECT");
        if (this._selectLayer == null) {
            this._selectLayer = document.createElement("select");
            this.layer.appendChild(this._selectLayer);
        }
    }

    setAllowMultipleSelection(value)
    {
        if (value == true)
            this._selectLayer.setAttribute("multiple", "multiple");
        else
            this._selectLayer.removeAttribute("multiple");
    }

    layout()
    {
        super.layout();

        var w = this.getWidth();
        var h = this.getHeight();

        this._selectLayer.style.marginLeft = "8px";
        this._selectLayer.style.width = (w - 16) + "px";
        this._selectLayer.style.marginTop = "4px";
        this._selectLayer.style.height = (h - 8) + "px";

        var color = this.getBackgroundColor();
        this._selectLayer.style.backgroundColor = color;
    }

    addItem(text, value?)
    {
        var option = document.createElement("option");
        option.innerHTML = text;
        if (value != null)
            option.value = value;
        this._selectLayer.appendChild(option);
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
        var node = this._selectLayer;

        while (this._selectLayer.hasChildNodes()) {              // selected elem has children

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
        if (this._selectLayer.childNodes.length == 0)
            return null;

        var option = this._selectLayer.childNodes[index];
        return option.innerHTML;
    }

    getSelectedItem()
    {
        return this._selectLayer.value;
    }

    getSelectedItemText()
    {
        for (var index = 0; index < this._selectLayer.childNodes.length; index++)
        {
            var option = this._selectLayer.childNodes[index];
            if (this._selectLayer.value == option.value)
                return option.innerHTML;
        }
    }

    selectItem(item)
    {
        this._selectLayer.value = item;
    }

    setOnChangeAction(target, action)
    {
        this.target = target;
        this.action = action;
        var instance = this;

        this._selectLayer.onchange = function()
        {
            if (instance.enabled)
                instance.action.call(target, instance._selectLayer.value);
        }
    }
}