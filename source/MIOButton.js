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
    MIOButtonType[MIOButtonType["MomentaryPushIn"] = 0] = "MomentaryPushIn";
    MIOButtonType[MIOButtonType["PushOnPushOff"] = 1] = "PushOnPushOff";
    MIOButtonType[MIOButtonType["PushIn"] = 2] = "PushIn";
})(MIOButtonType || (MIOButtonType = {}));
var MIOButton = (function (_super) {
    __extends(MIOButton, _super);
    function MIOButton() {
        _super.apply(this, arguments);
        this._statusStyle = null;
        this._titleStatusStyle = null;
        this._titleLayer = null;
        this._imageStatusStyle = null;
        this._imageLayer = null;
        this.target = null;
        this.action = null;
        this._selected = false;
        this.type = MIOButtonType.MomentaryPushIn;
    }
    MIOButton.prototype._customizeLayerSetup = function () {
        _super.prototype._customizeLayerSetup.call(this);
        var type = this.layer.getAttribute("data-type");
        if (type == "MomentaryPushIn")
            this.type = MIOButtonType.MomentaryPushIn;
        else if (type == "PushOnPushOff")
            this.type = MIOButtonType.PushOnPushOff;
        this._statusStyle = this.layer.getAttribute("data-status-style");
        // Check for title layer
        this._titleLayer = MIOLayerGetFirstElementWithTag(this.layer, "SPAN");
        if (this._titleLayer == null) {
            this._titleLayer = document.createElement("span");
            this.layer.appendChild(this._titleLayer);
        }
        if (this._titleLayer != null)
            this._titleStatusStyle = this._titleLayer.getAttribute("data-status-style");
        var key = this.layer.getAttribute("data-title");
        if (key != null)
            this.setTitle(MIOLocalizeString(key, key));
        // Check for img layer
        this._imageLayer = MIOLayerGetFirstElementWithTag(this.layer, "DIV");
        if (this._imageLayer != null) {
            this._imageStatusStyle = this._imageLayer.getAttribute("data-status-style");
        }
        // Check for status
        var status = this.layer.getAttribute("data-status");
        if (status == "selected")
            this.setSelected(true);
        // Prevent click
        this.layer.addEventListener("click", function (e) {
            e.stopPropagation();
        });
        var instance = this;
        this.layer.addEventListener("mousedown", function (e) {
            e.stopPropagation();
            if (instance.enabled) {
                if (instance.type == MIOButtonType.PushOnPushOff)
                    instance.setSelected(!instance._selected);
                else
                    instance.setSelected(true);
            }
        });
        this.layer.addEventListener("mouseup", function (e) {
            e.stopPropagation();
            if (instance.enabled) {
                if (instance.type == MIOButtonType.MomentaryPushIn)
                    instance.setSelected(false);
                if (instance.action != null && instance.target != null)
                    instance.action.call(instance.target, instance);
            }
        });
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
    Object.defineProperty(MIOButton.prototype, "title", {
        get: function () {
            return this._titleLayer.innerHTML;
        },
        set: function (title) {
            this.setTitle(title);
        },
        enumerable: true,
        configurable: true
    });
    MIOButton.prototype.setSelected = function (value) {
        if (this._selected == value)
            return;
        if (value == true) {
            if (this._statusStyle != null) {
                this.layer.classList.remove(this._statusStyle + "_off");
                this.layer.classList.add(this._statusStyle + "_on");
            }
            if (this._imageLayer != null && this._imageStatusStyle != null) {
                this._imageLayer.classList.remove(this._imageStatusStyle + "_off");
                this._imageLayer.classList.add(this._imageStatusStyle + "_on");
            }
            if (this._titleLayer != null && this._titleStatusStyle != null) {
                this._titleLayer.classList.remove(this._titleStatusStyle + "_off");
                this._titleLayer.classList.add(this._titleStatusStyle + "_on");
            }
            if (this._statusStyle == null && this._titleStatusStyle == null && this._imageStatusStyle == null)
                this.setAlpha(0.35);
        }
        else {
            if (this._statusStyle != null) {
                this.layer.classList.remove(this._statusStyle + "_on");
                this.layer.classList.add(this._statusStyle + "_off");
            }
            if (this._imageLayer != null && this._imageStatusStyle != null) {
                this._imageLayer.classList.remove(this._imageStatusStyle + "_on");
                this._imageLayer.classList.add(this._imageStatusStyle + "_off");
            }
            if (this._titleLayer != null && this._titleStatusStyle != null) {
                this._titleLayer.classList.remove(this._titleStatusStyle + "_on");
                this._titleLayer.classList.add(this._titleStatusStyle + "_off");
            }
            if (this._statusStyle == null && this._titleStatusStyle == null && this._imageStatusStyle == null)
                this.setAlpha(1);
        }
        this._selected = value;
    };
    return MIOButton;
}(MIOControl));
