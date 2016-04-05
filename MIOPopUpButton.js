/**
 * Created by godshadow on 12/3/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOControl.ts" />
function MIOPopUpButtonFromElementID(view, elementID) {
    var layer = MIOLayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;
    var button = new MIOPopUpButton();
    button.initWithLayer(layer);
    view._linkViewToSubview(button);
    return button;
}
var MIOPopUpButton = (function (_super) {
    __extends(MIOPopUpButton, _super);
    function MIOPopUpButton() {
        _super.call(this);
        this.selectLayer = null;
        this.target = null;
        this.action = null;
    }
    MIOPopUpButton.prototype.init = function () {
        _super.prototype.init.call(this);
        this._setupLayer();
    };
    MIOPopUpButton.prototype.initWithLayer = function (layer) {
        _super.prototype.initWithLayer.call(this, layer);
        this._setupLayer();
    };
    MIOPopUpButton.prototype._setupLayer = function () {
        this.selectLayer = document.createElement("select");
        this.selectLayer.classList.add("pop_up_style");
        this.layer.appendChild(this.selectLayer);
    };
    MIOPopUpButton.prototype.layout = function () {
        _super.prototype.layout.call(this);
        var w = this.getWidth();
        var h = this.getHeight();
        this.selectLayer.style.marginLeft = "8px";
        this.selectLayer.style.width = (w - 16) + "px";
        this.selectLayer.style.marginTop = "4px";
        this.selectLayer.style.height = (h - 8) + "px";
        var color = this.getBackgroundColor();
        this.selectLayer.style.backgroundColor = color;
    };
    MIOPopUpButton.prototype.addItem = function (text, value) {
        var option = document.createElement("option");
        option.innerHTML = text;
        if (value != null)
            option.value = value;
        this.selectLayer.appendChild(option);
    };
    MIOPopUpButton.prototype.addItems = function (items) {
        for (var count = 0; count < items.length; count++) {
            var text = items[count];
            this.addItem(text);
        }
    };
    MIOPopUpButton.prototype.removeAllItems = function () {
        var node = this.selectLayer;
        while (this.selectLayer.hasChildNodes()) {
            if (node.hasChildNodes()) {
                node = node.lastChild; // set current node to child
            }
            else {
                node = node.parentNode; // set node to parent
                node.removeChild(node.lastChild); // remove last node
            }
        }
    };
    MIOPopUpButton.prototype.getItemAtIndex = function (index) {
        if (this.selectLayer.childNodes.length == 0)
            return null;
        var option = this.selectLayer.childNodes[index];
        return option.innerHTML;
    };
    MIOPopUpButton.prototype.getSelectedItem = function () {
        return this.selectLayer.value;
    };
    MIOPopUpButton.prototype.getSelectedItemText = function () {
        for (var index = 0; index < this.selectLayer.childNodes.length; index++) {
            var option = this.selectLayer.childNodes[index];
            if (this.selectLayer.value == option.value)
                return option.innerHTML;
        }
    };
    MIOPopUpButton.prototype.selectItem = function (item) {
        this.selectLayer.value = item;
    };
    MIOPopUpButton.prototype.setOnChangeAction = function (target, action) {
        this.target = target;
        this.action = action;
        var instance = this;
        this.selectLayer.onchange = function () {
            if (instance.enabled)
                instance.action.call(target, instance.selectLayer.value);
        };
    };
    return MIOPopUpButton;
})(MIOControl);
//# sourceMappingURL=MIOPopUpButton.js.map