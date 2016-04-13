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
        _super.apply(this, arguments);
        this.selected = false;
        this._target = null;
        this._onClickFn = null;
        this._row = 0;
        this._section = 0;
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
var MIOTableViewSection = (function (_super) {
    __extends(MIOTableViewSection, _super);
    function MIOTableViewSection() {
        _super.apply(this, arguments);
        this.header = null;
        this.cells = [];
    }
    return MIOTableViewSection;
})(MIOObject);
var MIOTableView = (function (_super) {
    __extends(MIOTableView, _super);
    function MIOTableView() {
        _super.apply(this, arguments);
        this.dataSource = null;
        this.delegate = null;
        this.sections = [];
        this.headerView = null;
        this.selectedCellRow = -1;
        this.selectedCellSection = -1;
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
        cell.constructor.apply(cell);
        var html = item["html"];
        var css = item["css"];
        var elID = item["id"];
        var layer = MIOLayerFromResource(html, css, elID);
        cell.initWithLayer(layer);
        return cell;
    };
    MIOTableView.prototype.setHeaderView = function (view) {
        this.headerView = view;
        this.addSubview(this.headerView);
    };
    MIOTableView.prototype.reloadData = function () {
        // Remove all subviews
        for (var index = 0; index < this.sections.length; index++) {
            var section = this.sections[index];
            if (section.header != null)
                section.header.removeFromSuperview();
            for (var count = 0; count < section.cells.length; count++) {
                var cell = section.cells[count];
                cell.removeFromSuperview();
            }
        }
        this.sections = [];
        var sections = this.dataSource.numberOfSections(this);
        for (var sectionIndex = 0; sectionIndex < sections; sectionIndex++) {
            var section = new MIOTableViewSection();
            this.sections.push(section);
            var rows = this.dataSource.numberOfRowsInSection(this, sectionIndex);
            if (typeof this.dataSource.titleForHeaderInSection === "function") {
                var title = this.dataSource.titleForHeaderInSection(this, sectionIndex);
                var header = new MIOLabel();
                header.init();
                header.setHeight(22);
                header.setText(title);
                header.setTextRGBColor(255, 255, 255);
                header.layer.style.left = "10px";
                section.header = header;
                this.addSubview(header);
            }
            for (var index = 0; index < rows; index++) {
                var cell = this.dataSource.cellAtIndexPath(this, index, sectionIndex);
                cell.addObserver(this, "selected");
                section.cells.push(cell);
                this.addSubview(cell);
                cell._target = this;
                cell._onClickFn = this.cellOnClickFn;
                cell._row = index;
                cell._section = sectionIndex;
            }
        }
        this.layout();
    };
    MIOTableView.prototype.layout = function () {
        _super.prototype.layout.call(this);
        if (this.sections == null)
            return;
        var y = 0;
        var w = this.getWidth();
        if (this.headerView != null) {
            y += this.headerView.getHeight() + 1;
        }
        for (var count = 0; count < this.sections.length; count++) {
            var section = this.sections[count];
            if (section.header != null) {
                section.header.setY(y);
                y += 23;
            }
            for (var index = 0; index < section.cells.length; index++) {
                var h = 44;
                if (this.delegate != null) {
                    if (typeof this.delegate.heightForRowAtIndexPath === "function")
                        h = this.delegate.heightForRowAtIndexPath(this, count);
                }
                var cell = section.cells[index];
                cell.setY(y);
                cell.setWidth(w);
                cell.setHeight(h);
                y += h + 1;
            }
        }
    };
    MIOTableView.prototype.cellOnClickFn = function (cell) {
        var index = cell._row;
        var section = cell._section;
        if (this.selectedCellRow == index && this.selectedCellSection == section)
            return;
        if (this.selectedCellRow > -1 && this.selectedCellSection > -1)
            this.deselectCellAtIndexPath(this.selectedCellRow, this.selectedCellSection);
        this.selectedCellRow = index;
        this.selectedCellSection = section;
        this._selectCell(cell);
        if (this.delegate != null) {
            if (typeof this.delegate.didSelectCellAtIndexPath === "function")
                this.delegate.didSelectCellAtIndexPath(this, index, section);
        }
    };
    MIOTableView.prototype._selectCell = function (cell) {
        cell.setSelected(true);
    };
    MIOTableView.prototype.selectCellAtIndexPath = function (row, section) {
        this.selectedCellRow = row;
        this.selectedCellSection = section;
        var cell = this.sections[section].cells[row];
        this._selectCell(cell);
    };
    MIOTableView.prototype._deselectCell = function (cell) {
        cell.setSelected(false);
    };
    MIOTableView.prototype.deselectCellAtIndexPath = function (row, section) {
        this.selectedCellRow = -1;
        this.selectedCellSection = -1;
        var cell = this.sections[section].cells[row];
        this._deselectCell(cell);
    };
    return MIOTableView;
})(MIOView);
//# sourceMappingURL=MIOTableView.js.map