/**
 * Created by godshadow on 12/3/16.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/// <reference path="MUIControl.ts" />
var MUIButtonType;
(function (MUIButtonType) {
    MUIButtonType[MUIButtonType["MomentaryPushIn"] = 0] = "MomentaryPushIn";
    MUIButtonType[MUIButtonType["PushOnPushOff"] = 1] = "PushOnPushOff";
    MUIButtonType[MUIButtonType["PushIn"] = 2] = "PushIn";
})(MUIButtonType || (MUIButtonType = {}));
var MUIButton = (function (_super) {
    __extends(MUIButton, _super);
    function MUIButton() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._statusStyle = null;
        _this._titleStatusStyle = null;
        _this._titleLayer = null;
        _this._imageStatusStyle = null;
        _this._imageLayer = null;
        _this.target = null;
        _this.action = null;
        _this._selected = false;
        _this.type = MUIButtonType.MomentaryPushIn;
        return _this;
    }
    MUIButton.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        var type = this.layer.getAttribute("data-type");
        if (type == "MomentaryPushIn")
            this.type = MUIButtonType.MomentaryPushIn;
        else if (type == "PushOnPushOff")
            this.type = MUIButtonType.PushOnPushOff;
        this._statusStyle = this.layer.getAttribute("data-status-style-prefix");
        if (this._statusStyle == null && options != null)
            this._statusStyle = options["status-style-prefix"] + "_status";
        // Check for title layer
        this._titleLayer = MUILayerGetFirstElementWithTag(this.layer, "SPAN");
        if (this._titleLayer == null) {
            this._titleLayer = document.createElement("span");
            this.layer.appendChild(this._titleLayer);
        }
        if (this._titleLayer != null) {
            this._titleStatusStyle = this._titleLayer.getAttribute("data-status-style");
            if (this._titleStatusStyle == null && options != null)
                this._titleStatusStyle = options["status-style-prefix"] + "_title_status";
        }
        var key = this.layer.getAttribute("data-title");
        if (key != null)
            this.setTitle(MIOLocalizeString(key, key));
        // Check for img layer
        this._imageLayer = MUILayerGetFirstElementWithTag(this.layer, "DIV");
        if (this._imageLayer != null) {
            this._imageStatusStyle = this._imageLayer.getAttribute("data-status-style");
            if (this._imageStatusStyle == null && options != null)
                this._imageStatusStyle = options["status-style-prefix"] + "_image_status";
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
                if (instance.type == MUIButtonType.PushOnPushOff)
                    instance.setSelected(!instance._selected);
                else
                    instance.setSelected(true);
            }
        });
        this.layer.addEventListener("mouseup", function (e) {
            e.stopPropagation();
            if (instance.enabled) {
                if (instance.type == MUIButtonType.MomentaryPushIn)
                    instance.setSelected(false);
                if (instance.action != null && instance.target != null)
                    instance.action.call(instance.target, instance);
            }
        });
    };
    MUIButton.prototype.initWithAction = function (target, action) {
        _super.prototype.init.call(this);
        this.setAction(target, action);
    };
    MUIButton.prototype.setAction = function (target, action) {
        this.target = target;
        this.action = action;
    };
    MUIButton.prototype.setTitle = function (title) {
        this._titleLayer.innerHTML = title;
    };
    Object.defineProperty(MUIButton.prototype, "title", {
        get: function () {
            return this._titleLayer.innerHTML;
        },
        set: function (title) {
            this.setTitle(title);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MUIButton.prototype, "selected", {
        get: function () {
            return this._selected;
        },
        enumerable: true,
        configurable: true
    });
    MUIButton.prototype.setSelected = function (value) {
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
    return MUIButton;
}(MUIControl));
