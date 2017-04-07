/**
 * Created by godshadow on 2/5/16.
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
var MUIComboBox = (function (_super) {
    __extends(MUIComboBox, _super);
    function MUIComboBox() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._selectLayer = null;
        _this.target = null;
        _this.action = null;
        return _this;
    }
    MUIComboBox.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        this._selectLayer = MUILayerGetFirstElementWithTag(this.layer, "SELECT");
        if (this._selectLayer == null) {
            this._selectLayer = document.createElement("select");
            this.layer.appendChild(this._selectLayer);
        }
    };
    MUIComboBox.prototype.setAllowMultipleSelection = function (value) {
        if (value == true)
            this._selectLayer.setAttribute("multiple", "multiple");
        else
            this._selectLayer.removeAttribute("multiple");
    };
    MUIComboBox.prototype.layout = function () {
        _super.prototype.layout.call(this);
        var w = this.getWidth();
        var h = this.getHeight();
        this._selectLayer.style.marginLeft = "8px";
        this._selectLayer.style.width = (w - 16) + "px";
        this._selectLayer.style.marginTop = "4px";
        this._selectLayer.style.height = (h - 8) + "px";
        var color = this.getBackgroundColor();
        this._selectLayer.style.backgroundColor = color;
    };
    MUIComboBox.prototype.addItem = function (text, value) {
        var option = document.createElement("option");
        option.innerHTML = text;
        if (value != null)
            option.value = value;
        this._selectLayer.appendChild(option);
    };
    MUIComboBox.prototype.addItems = function (items) {
        for (var count = 0; count < items.length; count++) {
            var text = items[count];
            this.addItem(text);
        }
    };
    MUIComboBox.prototype.removeAllItems = function () {
        var node = this._selectLayer;
        while (this._selectLayer.hasChildNodes()) {
            if (node.hasChildNodes()) {
                node = node.lastChild; // set current node to child
            }
            else {
                node = node.parentNode; // set node to parent
                node.removeChild(node.lastChild); // remove last node
            }
        }
    };
    MUIComboBox.prototype.getItemAtIndex = function (index) {
        if (this._selectLayer.childNodes.length == 0)
            return null;
        var option = this._selectLayer.childNodes[index];
        return option.innerHTML;
    };
    MUIComboBox.prototype.getSelectedItem = function () {
        return this._selectLayer.value;
    };
    MUIComboBox.prototype.getSelectedItemText = function () {
        for (var index = 0; index < this._selectLayer.childNodes.length; index++) {
            var option = this._selectLayer.childNodes[index];
            if (this._selectLayer.value == option.value)
                return option.innerHTML;
        }
    };
    MUIComboBox.prototype.selectItem = function (item) {
        this._selectLayer.value = item;
    };
    MUIComboBox.prototype.setOnChangeAction = function (target, action) {
        this.target = target;
        this.action = action;
        var instance = this;
        this._selectLayer.onchange = function () {
            if (instance.enabled)
                instance.action.call(target, instance._selectLayer.value);
        };
    };
    return MUIComboBox;
}(MUIControl));
