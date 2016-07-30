/**
 * Created by godshadow on 12/3/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOControl.ts" />
/// <reference path="MIOString.ts" />
function MIOButtonFromElementID(view, elementID) {
    var layer = MIOLayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;
    var button = new MIOButton(elementID);
    button.initWithLayer(layer);
    view._linkViewToSubview(button);
    return button;
}
var MIOButtonType;
(function (MIOButtonType) {
    MIOButtonType[MIOButtonType["PushPop"] = 0] = "PushPop";
    MIOButtonType[MIOButtonType["Push"] = 1] = "Push";
    MIOButtonType[MIOButtonType["TabBar"] = 2] = "TabBar";
})(MIOButtonType || (MIOButtonType = {}));
var MIOButton = (function (_super) {
    __extends(MIOButton, _super);
    function MIOButton() {
        _super.apply(this, arguments);
        this._titleLayer = null;
        this._imageLayer = null;
        this._titleSelectedStyles = null;
        this._titleNormalStyles = null;
        this._imageNormalStyles = null;
        this._imageSelectedStyles = null;
        this.target = null;
        this.action = null;
        this.selected = null;
        this.type = MIOButtonType.PushPop;
    }
    MIOButton.prototype.init = function () {
        _super.prototype.init.call(this);
        this._setupLayer();
    };
    MIOButton.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        this._setupLayer();
    };
    MIOButton.prototype._setupLayer = function () {
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
        this.layer.onmousedown = function () {
            if (instance.enabled) {
                if (instance.type == MIOButtonType.Push)
                    instance.setSelected(!instance.selected);
                else
                    instance.setSelected(true);
            }
        };
        this.layer.onmouseup = function () {
            if (instance.enabled) {
                if (instance.type == MIOButtonType.PushPop)
                    instance.setSelected(false);
                if (instance.action != null && instance.target != null)
                    instance.action.call(instance.target);
            }
        };
    };
    MIOButton.prototype.initWithAction = function (target, action) {
        _super.prototype.init.call(this);
        this.setAction(target, action);
    };
    MIOButton.prototype.setAction = function (target, action) {
        this.target = target;
        this.action = action;
    };
    MIOButton.prototype.setTitle = function (title) {
        this._titleLayer.innerHTML = title;
    };
    MIOButton.prototype.setSelected = function (value) {
        if (this.selected == value)
            return;
        if (value == true) {
            if (this.type != MIOButtonType.TabBar) {
                this.layer.classList.remove("button_normal");
                this.layer.classList.add("button_selected");
            }
            this._titleLayer.classList.remove(this._titleNormalStyles);
            this._titleLayer.classList.add(this._titleSelectedStyles);
            if (this._imageLayer != null) {
                this._imageLayer.classList.remove(this._imageNormalStyles);
                this._imageLayer.classList.add(this._imageSelectedStyles);
            }
        }
        else {
            if (this.type != MIOButtonType.TabBar) {
                this.layer.classList.remove("button_selected");
                this.layer.classList.add("button_normal");
            }
            this._titleLayer.classList.remove(this._titleSelectedStyles);
            this._titleLayer.classList.add(this._titleNormalStyles);
            if (this._imageLayer != null) {
                this._imageLayer.classList.remove(this._imageSelectedStyles);
                this._imageLayer.classList.add(this._imageNormalStyles);
            }
        }
        this.selected = value;
    };
    return MIOButton;
}(MIOControl));
//# sourceMappingURL=MIOButton.js.map