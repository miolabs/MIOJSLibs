/**
 * Created by godshadow on 09/11/2016.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOView.ts" />
/// <reference path="MIOCoreTypes.ts" />
var MIOCollectionViewLayout = (function () {
    function MIOCollectionViewLayout() {
        this.paddingTop = 0;
        this.paddingLeft = 0;
        this.paddingRight = 0;
        this.spaceX = 0;
        this.spaceY = 0;
    }
    return MIOCollectionViewLayout;
}());
var MIOCollectionViewFlowLayout = (function (_super) {
    __extends(MIOCollectionViewFlowLayout, _super);
    function MIOCollectionViewFlowLayout() {
        _super.call(this);
        this.paddingTop = 10;
        this.paddingLeft = 0;
        this.paddingRight = 0;
        this.spaceX = 10;
        this.spaceY = 10;
    }
    return MIOCollectionViewFlowLayout;
}(MIOCollectionViewLayout));
var MIOCollectionViewCell = (function (_super) {
    __extends(MIOCollectionViewCell, _super);
    function MIOCollectionViewCell() {
        _super.call(this, MIOViewGetNextLayerID("collectionview_cell"));
        this._target = null;
        this._onClickFn = null;
        this._index = null;
        this._section = null;
        this.selected = false;
    }
    MIOCollectionViewCell.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        this._setupLayer();
    };
    MIOCollectionViewCell.prototype._setupLayer = function () {
        var instance = this;
        this.layer.addEventListener("click", function (e) {
            e.stopPropagation();
            if (instance._onClickFn != null)
                instance._onClickFn.call(instance._target, instance);
        });
    };
    MIOCollectionViewCell.prototype.setSelected = function (value) {
        this.willChangeValue("selected");
        this.selected = value;
        this.didChangeValue("selected");
    };
    return MIOCollectionViewCell;
}(MIOView));
var MIOCollectionViewSection = (function (_super) {
    __extends(MIOCollectionViewSection, _super);
    function MIOCollectionViewSection() {
        _super.apply(this, arguments);
        this.header = null;
        this.footer = null;
        this.cells = [];
    }
    return MIOCollectionViewSection;
}(MIOObject));
var MIOCollectionView = (function (_super) {
    __extends(MIOCollectionView, _super);
    function MIOCollectionView() {
        _super.apply(this, arguments);
        this.dataSource = null;
        this.delegate = null;
        this._collectionViewLayout = null;
        this._cellPrototypes = {};
        this._supplementaryViews = {};
        this._sections = [];
        this.selectedCellIndex = -1;
        this.selectedCellSection = -1;
    }
    Object.defineProperty(MIOCollectionView.prototype, "collectionViewLayout", {
        get: function () {
            if (this._collectionViewLayout == null)
                this._collectionViewLayout = new MIOCollectionViewFlowLayout();
            return this._collectionViewLayout;
        },
        set: function (layout) {
            //TODO: Set animations for changing layout
            this._collectionViewLayout = layout;
        },
        enumerable: true,
        configurable: true
    });
    MIOCollectionView.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        // Check if we have prototypes
        if (this.layer.childNodes.length > 0) {
            for (var index = 0; index < this.layer.childNodes.length; index++) {
                var subLayer = this.layer.childNodes[index];
                if (subLayer.tagName != "DIV")
                    continue;
                if (subLayer.getAttribute("data-cell-identifier") != null) {
                    this._addCellPrototypeWithLayer(subLayer);
                    subLayer.style.display = "none";
                }
                else if (subLayer.getAttribute("data-supplementary-view-identifier") != null) {
                    this._addSupplementaryViewPrototypeWithLayer(subLayer);
                    subLayer.style.display = "none";
                }
            }
        }
    };
    MIOCollectionView.prototype._addCellPrototypeWithLayer = function (subLayer) {
        var cellIdentifier = subLayer.getAttribute("data-cell-identifier");
        var cellClassname = subLayer.getAttribute("data-class");
        if (cellClassname == null)
            cellClassname = "MIOCollectionViewCell";
        var item = {};
        item["class"] = cellClassname;
        item["layer"] = subLayer;
        var size = new MIOSize(subLayer.clientWidth, subLayer.clientHeight);
        if (size != null)
            item["size"] = size;
        var bg = window.getComputedStyle(subLayer, null).getPropertyValue('background-color');
        if (bg != null)
            item["bg"] = bg;
        this._cellPrototypes[cellIdentifier] = item;
    };
    MIOCollectionView.prototype._addSupplementaryViewPrototypeWithLayer = function (subLayer) {
        var viewIdentifier = subLayer.getAttribute("data-supplementary-view-identifier");
        var viewClassname = subLayer.getAttribute("data-class");
        if (viewClassname == null)
            viewClassname = "MIOView";
        var item = {};
        item["class"] = viewClassname;
        item["layer"] = subLayer;
        var size = new MIOSize(subLayer.clientWidth, subLayer.clientHeight);
        if (size != null)
            item["size"] = size;
        var bg = window.getComputedStyle(subLayer, null).getPropertyValue('background-color');
        if (bg != null)
            item["bg"] = bg;
        this._supplementaryViews[viewIdentifier] = item;
    };
    MIOCollectionView.prototype.registerClassForCellWithReuseIdentifier = function (cellClass, resource, identifier) {
        //TODO:
    };
    MIOCollectionView.prototype.registerClassForSupplementaryViewWithReuseIdentifier = function (viewClass, resource, identifier) {
        //TODO:
    };
    MIOCollectionView.prototype.dequeueReusableCellWithIdentifier = function (identifier) {
        var item = this._cellPrototypes[identifier];
        //instance creation here
        var className = item["class"];
        var cell = Object.create(window[className].prototype);
        cell.constructor.apply(cell);
        //cell.init();
        var layer = item["layer"];
        if (layer != null) {
            var newLayer = layer.cloneNode(true);
            newLayer.style.display = "";
            // var size = item["size"];
            // if (size != null) {
            //     cell.setWidth(size.width);
            //     cell.setHeight(size.height);
            // }
            // var bg = item["bg"];
            // if (bg != null) {
            //     cell.layer.style.background = bg;
            // }
            cell.initWithLayer(newLayer);
            cell.awakeFromHTML();
        }
        else {
            var cells = item["cells"];
            if (cells == null) {
                cells = [];
                item["cells"] = cells;
            }
            cells.push(cell);
        }
        return cell;
    };
    MIOCollectionView.prototype.dequeueReusableSupplementaryViewWithReuseIdentifier = function (identifier) {
        var item = this._supplementaryViews[identifier];
        //instance creation here
        var className = item["class"];
        var view = Object.create(window[className].prototype);
        view.constructor.apply(view);
        //view.init();
        var layer = item["layer"];
        if (layer != null) {
            var newLayer = layer.cloneNode(true);
            newLayer.style.display = "";
            // var size = item["size"];
            // if (size != null) {
            //     view.setWidth(size.width);
            //     view.layer.style.width = "100%";
            //     view.setHeight(size.height);
            // }
            // var bg = item["bg"];
            // if (bg != null) {
            //     view.layer.style.background = bg;
            // }
            view.initWithLayer(newLayer);
            //view._addLayerToDOM();
            view.awakeFromHTML();
        }
        else {
            var views = item["views"];
            if (views == null) {
                views = [];
                item["views"] = views;
            }
            views.push(view);
        }
        return view;
    };
    MIOCollectionView.prototype.cellAtIndexPath = function (index, section) {
        var s = this._sections[section];
        var c = s.cells[index];
        return c;
    };
    MIOCollectionView.prototype.reloadData = function () {
        if (this.dataSource == null)
            return;
        // Remove all subviews
        for (var index = 0; index < this._sections.length; index++) {
            var sectionView = this._sections[index];
            if (sectionView.header != null)
                sectionView.header.removeFromSuperview();
            if (sectionView.footer != null)
                sectionView.footer.removeFromSuperview();
            for (var count = 0; count < sectionView.cells.length; count++) {
                var cell = sectionView.cells[count];
                cell.removeFromSuperview();
            }
        }
        this._sections = [];
        var sections = this.dataSource.numberOfSections(this);
        for (var sectionIndex = 0; sectionIndex < sections; sectionIndex++) {
            var section = new MIOCollectionViewSection();
            section.init();
            this._sections.push(section);
            if (typeof this.dataSource.viewForSupplementaryViewAtIndex === "function") {
                var hv = this.dataSource.viewForSupplementaryViewAtIndex(this, "header", index, sectionIndex);
                section.header = hv;
                if (hv != null)
                    this.addSubview(hv);
            }
            var items = this.dataSource.numberOfItemsInSection(this, sectionIndex);
            for (var index = 0; index < items; index++) {
                var cell = this.dataSource.cellForItemAtIndex(this, index, sectionIndex);
                section.cells.push(cell);
                this.addSubview(cell);
                // events
                cell._target = this;
                cell._onClickFn = this.cellOnClickFn;
                cell._index = index;
                cell._section = sectionIndex;
            }
            if (typeof this.dataSource.viewForSupplementaryViewAtIndex === "function") {
                var fv = this.dataSource.viewForSupplementaryViewAtIndex(this, "footer", index, sectionIndex);
                section.footer = fv;
                if (fv != null)
                    this.addSubview(fv);
            }
        }
        this.layout();
    };
    MIOCollectionView.prototype.cellOnClickFn = function (cell) {
        var index = cell._index;
        var section = cell._section;
        var canSelectCell = true;
        // if (this.selectedCellIndex == index && this.selectedCellSection == section)
        //     return;
        if (this.delegate != null) {
            if (typeof this.delegate.canSelectCellAtIndexPath === "function")
                canSelectCell = this.delegate.canSelectCellAtIndexPath(this, index, section);
        }
        if (canSelectCell == false)
            return;
        if (this.selectedCellIndex > -1 && this.selectedCellSection > -1)
            this.deselectCellAtIndexPath(this.selectedCellIndex, this.selectedCellSection);
        this.selectedCellIndex = index;
        this.selectedCellSection = section;
        this._selectCell(cell);
        if (this.delegate != null) {
            if (typeof this.delegate.didSelectCellAtIndexPath === "function")
                this.delegate.didSelectCellAtIndexPath(this, index, section);
        }
    };
    MIOCollectionView.prototype._selectCell = function (cell) {
        cell.setSelected(true);
    };
    MIOCollectionView.prototype.selectCellAtIndexPath = function (index, section) {
        this.selectedCellIndex = index;
        this.selectedCellSection = section;
        var cell = this._sections[section].cells[index];
        this._selectCell(cell);
    };
    MIOCollectionView.prototype._deselectCell = function (cell) {
        cell.setSelected(false);
    };
    MIOCollectionView.prototype.deselectCellAtIndexPath = function (row, section) {
        this.selectedCellIndex = -1;
        this.selectedCellSection = -1;
        var cell = this._sections[section].cells[row];
        this._deselectCell(cell);
    };
    MIOCollectionView.prototype.layout = function () {
        _super.prototype.layout.call(this);
        if (this._collectionViewLayout == null)
            this._collectionViewLayout = new MIOCollectionViewFlowLayout();
        if (this._sections == null)
            return;
        var x = this.collectionViewLayout.paddingLeft;
        var y = this.collectionViewLayout.paddingTop;
        for (var count = 0; count < this._sections.length; count++) {
            var section = this._sections[count];
            x = this.collectionViewLayout.paddingLeft;
            // Add header view
            if (section.header != null) {
                section.header.setY(y);
                var offsetY = section.header.getHeight();
                if (offsetY <= 0)
                    offsetY = 23;
                y += offsetY + this.collectionViewLayout.spaceY;
            }
            // Add cells
            var offsetY;
            for (var index = 0; index < section.cells.length; index++) {
                var cell = section.cells[index];
                var offsetX = cell.getWidth() + this.collectionViewLayout.spaceX;
                if (offsetX <= 0)
                    offsetX = 44;
                var oy = cell.getHeight();
                if (oy <= 0)
                    oy = 44;
                if (oy > offsetY)
                    offsetY = oy;
                if ((x + offsetX + this.collectionViewLayout.paddingRight) > this.getWidth()) {
                    x = this.collectionViewLayout.paddingLeft;
                    y += offsetY + this.collectionViewLayout.spaceY;
                }
                cell.setX(x);
                cell.setY(y);
                x += offsetX + this.collectionViewLayout.paddingLeft;
            }
            if (x > 0)
                y += offsetY + this.collectionViewLayout.paddingTop;
            // Add footer view
            if (section.footer != null) {
                section.footer.setY(y);
                var offsetY = section.footer.getHeight();
                if (offsetY <= 0)
                    offsetY = 23;
                y += offsetY + this.collectionViewLayout.paddingTop;
            }
        }
    };
    return MIOCollectionView;
}(MIOView));
