/**
 * Created by godshadow on 12/3/16.
 */

    /// <reference path="MIOControl.ts" />
    /// <reference path="MIOString.ts" />

function MIOButtonFromElementID(view, elementID)
{
    var layer = MIOLayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;

    var button = new MIOButton(elementID);
    button.initWithLayer(layer);
    view._linkViewToSubview(button);

    return button;
}

enum MIOButtonType
{
    PushPop,
    Push,
    TabBar
}

class MIOButton extends MIOControl
{
    private _titleLayer = null;
    private _imageLayer = null;

    private _titleSelectedStyles = null;
    private _titleNormalStyles = null;

    private _imageNormalStyles = null;
    private _imageSelectedStyles = null;

    target = null;
    action = null;

    selected = null;
    type = MIOButtonType.PushPop;

    init()
    {
        super.init();
        this._setupLayer();
    }

    initWithLayer(layer, options?)
    {
        super.initWithLayer(layer, options);
        this._setupLayer();
    }

    _setupLayer()
    {
        var type = this.layer.getAttribute("data-type");
        if (type == "Push")
            this.type = MIOButtonType.Push;
        else if (type == "PushPop")
            this.type = MIOButtonType.PushPop;
        else if (type == "TabBar")
            this.type = MIOButtonType.TabBar;

        // Check for title layer
        this._titleLayer = MIOLayerGetFirstElementWithTag(this.layer, "SPAN");

        if (this._titleLayer == null) {
            this._titleLayer = document.createElement("span");
            this._titleLayer.style.textAlign = "center";
            this.layer.appendChild(this._titleLayer);
        }

        var key = this.layer.getAttribute("data-title");
        if (key != null)
            this.setTitle(MIOLocalizeString(key, key));

        this._titleNormalStyles = this._titleLayer.getAttribute("class");
        this._titleSelectedStyles = this._titleLayer.getAttribute("data-selected-styles");

        this._imageLayer = MIOLayerGetFirstElementWithTag(this.layer, "IMG");

        if (this._imageLayer != null) {
            this._imageNormalStyles = this._imageLayer.getAttribute("data-status-normal-style");
            this._imageSelectedStyles = this._imageLayer.getAttribute("data-status-selected-style");
        }

        // Check for status
        var status = this.layer.getAttribute("data-status");
        if (status == "selected")
            this.setSelected(true);
        else
            this.setSelected(false);

        var instance = this;
        this.layer.onmousedown = function()
        {
            if (instance.enabled) {
                if (instance.type == MIOButtonType.Push)
                    instance.setSelected(!instance.selected);
                else
                    instance.setSelected(true);
            }
        }

        this.layer.onmouseup = function()
        {
            if (instance.enabled) {
                if (instance.type == MIOButtonType.PushPop)
                    instance.setSelected(false);
                if (instance.action != null && instance.target != null)
                    instance.action.call(instance.target);
            }
        }
    }

    initWithAction(target, action)
    {
        super.init();

        this.setAction(target, action);
    }

    setAction(target, action)
    {
        this.target = target;
        this.action = action;
    }

    setTitle(title)
    {
        this._titleLayer.innerHTML = title;
    }

    setSelected(value)
    {
        if (this.selected == value)
            return;

        if (value == true) {

            if (this.type != MIOButtonType.TabBar)
            {
                this.layer.classList.remove("button_normal");
                this.layer.classList.add("button_selected");
            }

            this._titleLayer.classList.remove(this._titleNormalStyles);
            this._titleLayer.classList.add(this._titleSelectedStyles);

            if (this._imageLayer != null)
            {
                this._imageLayer.classList.remove(this._imageNormalStyles);
                this._imageLayer.classList.add(this._imageSelectedStyles);
            }
        }
        else
        {
            if (this.type != MIOButtonType.TabBar)
            {
                this.layer.classList.remove("button_selected");
                this.layer.classList.add("button_normal");
            }

            this._titleLayer.classList.remove(this._titleSelectedStyles);
            this._titleLayer.classList.add(this._titleNormalStyles);

            if (this._imageLayer != null)
            {
                this._imageLayer.classList.remove(this._imageSelectedStyles);
                this._imageLayer.classList.add(this._imageNormalStyles);
            }
        }

        this.selected = value;
    }
}



