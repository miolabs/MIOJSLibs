/**
 * Created by godshadow on 22/3/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOView.ts" />
function MIOTableViewFromElementID(view, elementID) {
    var layer = MIOLayerSearchElementByID(view.layer, elementID);
    if (layer == null)
        return null;
    var tv = new MIOTableView();
    tv.initWithLayer(layer);
    view._linkViewToSubview(tv);
    return tv;
}
var MIOTableViewCell = (function (_super) {
    __extends(MIOTableViewCell, _super);
    function MIOTableViewCell() {
        _super.call(this);
        this.selected = false;
        this._target = null;
        this._onClickFn = null;
    }
    MIOTableViewCell.prototype.init = function () {
        _super.prototype.init.call(this);
        this._setupLayer();
    };
    MIOTableViewCell.prototype.initWithLayer = function (layer) {
        _super.prototype.initWithLayer.call(this, layer);
        this._setupLayer();
    };
    MIOTableViewCell.prototype._setupLayer = function () {
        var instance = this;
        this.layer.classList.add("tableviewcell_deselected_color");
        this.layer.onclick = function () {
            if (instance._onClickFn != null)
                instance._onClickFn.call(instance._target, instance);
        };
    };
    MIOTableViewCell.prototype.setSelected = function (value) {
        this.willChangeValue("selected");
        this.selected = value;
        if (value == true) {
            this.layer.classList.remove("tableviewcell_deselected_color");
            this.layer.classList.add("tableviewcell_selected_color");
        }
        else {
            this.layer.classList.remove("tableviewcell_selected_color");
            this.layer.classList.add("tableviewcell_deselected_color");
        }
        this._setHightlightedSubviews(value);
        this.didChangeValue("selected");
    };
    MIOTableViewCell.prototype._setHightlightedSubviews = function (value) {
        for (var count = 0; count < this.subviews.length; count++) {
            var v = this.subviews[count];
            if (v instanceof MIOLabel)
                v.setHightlighted(value);
        }
    };
    return MIOTableViewCell;
})(MIOView);
var MIOTableView = (function (_super) {
    __extends(MIOTableView, _super);
    function MIOTableView() {
        _super.call(this);
        this.dataSource = null;
        this.delegate = null;
        this.cells = [];
        this.selectedCellIndex = -1;
        this.cellPrototypes = {};
    }
    MIOTableView.prototype.addCellPrototypeWithIdentifier = function (identifier, classname, html, css, elementID) {
        var item = { "html": html, "css": css, "id": elementID, "class": classname };
        this.cellPrototypes[identifier] = item;
    };
    MIOTableView.prototype.cellWithIdentifier = function (identifier) {
        var item = this.cellPrototypes[identifier];
        //instance creation here
        var className = item["class"];
        var cell = Object.create(window[className].prototype);
        cell.constructor.apply(cell, new Array("World"));
        var html = item["html"];
        var css = item["css"];
        var elID = item["id"];
        var layer = MIOLayerFromResource(html, css, elID);
        cell.initWithLayer(layer);
        return cell;
    };
    MIOTableView.prototype.reloadData = function () {
        this.removeAllSubviews();
        this.cells = [];
        var rows = this.dataSource.numberOfRowsForTableView(this);
        for (var count = 0; count < rows; count++) {
            var cell = this.dataSource.cellAtIndexForTableView(this, count);
            cell.addObserver(this, "selected");
            this.cells.push(cell);
            this.addSubview(cell);
            cell._target = this;
            cell._onClickFn = this.cellOnClickFn;
        }
        this.layout();
    };
    MIOTableView.prototype.layout = function () {
        _super.prototype.layout.call(this);
        var y = 0;
        var w = this.getWidth();
        for (var count = 0; count < this.cells.length; count++) {
            var h = 44;
            if (this.delegate != null) {
                if (typeof this.delegate.heightForRowAtIndexForTableView === "function")
                    h = this.delegate.heightForRowAtIndexForTableView(this, count);
            }
            var cell = this.cells[count];
            cell.setY(y);
            cell.setWidth(w);
            cell.setHeight(h);
            y += h + 1;
        }
    };
    MIOTableView.prototype.cellOnClickFn = function (cell) {
        var index = this.cells.indexOf(cell);
        if (this.selectedCellIndex == index)
            return;
        if (this.selectedCellIndex > -1)
            this.deselectCellAtIndex(this.selectedCellIndex);
        this.selectedCellIndex = index;
        this._selectCell(cell);
        if (this.delegate != null) {
            if (typeof this.delegate.didSelectCellAtIndex === "function")
                this.delegate.didSelectCellAtIndex(index);
        }
    };
    MIOTableView.prototype._selectCell = function (cell) {
        cell.setSelected(true);
    };
    MIOTableView.prototype.selectCellAtIndex = function (index) {
        this.selectedCellIndex = index;
        var cell = this.cells[index];
        this._selectCell(cell);
    };
    MIOTableView.prototype._deselectCell = function (cell) {
        cell.setSelected(false);
    };
    MIOTableView.prototype.deselectCellAtIndex = function (index) {
        this.selectedCellIndex = -1;
        var cell = this.cells[index];
        this._deselectCell(cell);
    };
    return MIOTableView;
})(MIOView);
//# sourceMappingURL=MIOTableView.js.map