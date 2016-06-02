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
var MIOButton = (function (_super) {
    __extends(MIOButton, _super);
    function MIOButton() {
        _super.apply(this, arguments);
        this._titleLayer = null;
        this.target = null;
        this.action = null;
        this.selected = false;
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
        // Check for title layer
        this._titleLayer = MIOLayerGetFirstElementWithTag(this.layer, "SPAN");
        if (this._titleLayer == null) {
            this._titleLayer = document.createElement("span");
            this._titleLayer.style.textAlign = "center";
        }
        this.layer.appendChild(this._titleLayer);
        var key = this.layer.getAttribute("data-title");
        if (key != null)
            this.setTitle(MIOLocalizeString(key, key));
        this.layer.classList.add("button");
        var instance = this;
        this.layer.onmousedown = function () {
            if (instance.enabled) {
                instance.setSelected(true);
            }
        };
        this.layer.onmouseup = function () {
            if (instance.enabled) {
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
        if (value == true) {
            this.layer.classList.remove("button_normal");
            this.layer.classList.add("button_selected");
        }
        else {
            this.layer.classList.remove("button_selected");
            this.layer.classList.add("button_normal");
        }
        this.selected = value;
    };
    return MIOButton;
})(MIOControl);
//# sourceMappingURL=MIOButton.js.map