/**
 * Created by godshadow on 09/11/2016.
 */

/// <reference path="MUIView.ts" />
/// <reference path="MUICollectionViewLayout.ts" />


class MUICollectionViewCell extends MUIView
{
    _target = null;
    _onClickFn = null;
    _index = null;
    _section = null;

    selected = false;

    initWithLayer(layer, owner, options){
        super.initWithLayer(layer, owner, options);
        this._setupLayer();
    }

    private _setupLayer() {
        var instance = this;

        this.layer.addEventListener("click", function(e) {

            e.stopPropagation();
            if (instance._onClickFn != null)
                instance._onClickFn.call(instance._target, instance);
        });
    }

    setSelected(value) {
        this.willChangeValue("selected");
        this.selected = value;
        this.didChangeValue("selected");
    }
}

class MUICollectionViewSection extends MIOObject
{
    header = null;
    footer = null;
    cells = [];
}

class MUICollectionView extends MUIView
{
    dataSource = null;
    delegate = null;

    private _collectionViewLayout:MUICollectionViewFlowLayout = null;

    private _cellPrototypes = {};
    private _supplementaryViews = {};

    private _sections = [];

    selectedCellIndex = -1;
    selectedCellSection = -1;

    public get collectionViewLayout():MUICollectionViewFlowLayout{
        if (this._collectionViewLayout == null) {
            this._collectionViewLayout = new MUICollectionViewFlowLayout();
            this._collectionViewLayout.init();
        }

        return this._collectionViewLayout;
    }

    public set collectionViewLayout(layout:MUICollectionViewFlowLayout){
        //TODO: Set animations for changing layout
        layout.collectionView = this;
        this._collectionViewLayout = layout;        
        layout.invalidateLayout();
    }

    initWithLayer(layer, options){
        super.initWithLayer(layer, options);

        // Check if we have prototypes
        if (this.layer.childNodes.length > 0){
            for(var index = 0; index < this.layer.childNodes.length; index++){
                var subLayer = this.layer.childNodes[index];

                if (subLayer.tagName != "DIV")
                    continue;

                if (subLayer.getAttribute("data-cell-identifier") != null) {
                    this._addCellPrototypeWithLayer(subLayer);
                    subLayer.style.display = "none";
                }
                else if (subLayer.getAttribute("data-supplementary-view-identifier") != null){
                    this._addSupplementaryViewPrototypeWithLayer(subLayer);
                    subLayer.style.display = "none";
                }
            }
        }
    }

    private _addCellPrototypeWithLayer(subLayer){
        var cellIdentifier = subLayer.getAttribute("data-cell-identifier");
        var cellClassname = subLayer.getAttribute("data-class");
        if (cellClassname == null) cellClassname = "MIOCollectionViewCell";

        var item = {};
        item["class"] = cellClassname;
        item["layer"] = subLayer;
        var size = new MIOSize(subLayer.clientWidth, subLayer.clientHeight);
        if (size != null) item["size"] = size;
        var bg = window.getComputedStyle( subLayer ,null).getPropertyValue('background-color');
        if (bg != null) item["bg"] = bg;

        this._cellPrototypes[cellIdentifier] = item;
    }

    private _addSupplementaryViewPrototypeWithLayer(subLayer){
        var viewIdentifier = subLayer.getAttribute("data-supplementary-view-identifier");
        var viewClassname = subLayer.getAttribute("data-class");
        if (viewClassname == null) viewClassname = "MIOView";

        var item = {};
        item["class"] = viewClassname;
        item["layer"] = subLayer;
        var size = new MIOSize(subLayer.clientWidth, subLayer.clientHeight);
        if (size != null) item["size"] = size;
        var bg = window.getComputedStyle( subLayer ,null).getPropertyValue('background-color');
        if (bg != null) item["bg"] = bg;

        this._supplementaryViews[viewIdentifier] = item;
    }

    registerClassForCellWithReuseIdentifier(cellClass, resource, identifier){
        //TODO:
    }

    registerClassForSupplementaryViewWithReuseIdentifier(viewClass, resource, identifier){
        //TODO:
    }

    dequeueReusableCellWithIdentifier(identifier){
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
    }

    dequeueReusableSupplementaryViewWithReuseIdentifier(identifier){
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
    }

    cellAtIndexPath(indexPath:MIOIndexPath){
        var s = this._sections[indexPath.section];
        var c = s.cells[indexPath.row];

        return c;
    }

    public reloadData(){
        
        if (this.dataSource == null) return;

        // Remove all subviews
        for (var index = 0; index < this._sections.length; index++)
        {
            var sectionView = this._sections[index];
            if (sectionView.header != null)
                sectionView.header.removeFromSuperview();

            if (sectionView.footer != null)
                sectionView.footer.removeFromSuperview();

            for (var count = 0; count < sectionView.cells.length; count++){
                var cell = sectionView.cells[count];
                cell.removeFromSuperview();
                if (this.delegate != null) {
                    if (typeof this.delegate.didEndDisplayingCellAtIndexPath === "function"){
                        let ip = MIOIndexPath.indexForRowInSection(count, index);
                        this.delegate.didEndDisplayingCellAtIndexPath(this, cell, ip);
                    }
                }                
            }
        }

        this._sections = [];

        var sections = this.dataSource.numberOfSections(this);
        for (var sectionIndex = 0; sectionIndex < sections; sectionIndex++) {

            var section = new MUICollectionViewSection();
            section.init();
            this._sections.push(section);

            if (typeof this.dataSource.viewForSupplementaryViewAtIndex === "function")
            {
                var hv = this.dataSource.viewForSupplementaryViewAtIndex(this, "header", sectionIndex);
                section.header = hv;
                if (hv != null) this.addSubview(hv);
            }

            var items = this.dataSource.numberOfItemsInSection(this, sectionIndex);
            for (var index = 0; index < items; index++) {

                let ip = MIOIndexPath.indexForRowInSection(index, sectionIndex);
                let cell = this.dataSource.cellForItemAtIndexPath(this, ip);
                section.cells.push(cell);
                this.addSubview(cell);

                // events
                cell._target = this;
                cell._onClickFn = this.cellOnClickFn;
                cell._index = index;
                cell._section = sectionIndex;
            }

            if (typeof this.dataSource.viewForSupplementaryViewAtIndex === "function")
            {
                var fv = this.dataSource.viewForSupplementaryViewAtIndex(this, "footer", sectionIndex);
                section.footer = fv;
                if (fv != null) this.addSubview(fv);
            }
        }

        this.collectionViewLayout.invalidateLayout();
        this.setNeedsDisplay();
    }

    cellOnClickFn(cell){
        var index = cell._index;
        var section = cell._section;

        var canSelectCell = true;

        // if (this.selectedCellIndex == index && this.selectedCellSection == section)
        //     return;

        if (this.delegate != null)
        {
            if (typeof this.delegate.canSelectCellAtIndexPath === "function")
                canSelectCell = this.delegate.canSelectCellAtIndexPath(this, index, section);
        }

        if (canSelectCell == false)
            return;

        if (this.selectedCellIndex > -1 && this.selectedCellSection > -1){
            let ip = MIOIndexPath.indexForRowInSection(this.selectedCellIndex, this.selectedCellSection);
            this.deselectCellAtIndexPath(ip);
        }

        this.selectedCellIndex = index;
        this.selectedCellSection = section;

        this._selectCell(cell);

        if (this.delegate != null){
            if (typeof this.delegate.didSelectCellAtIndexPath === "function"){
                let ip = MIOIndexPath.indexForRowInSection(index, section);
                this.delegate.didSelectCellAtIndexPath(this, ip);
            }
        }

    }

    _selectCell(cell)
    {
        cell.setSelected(true);
    }

    selectCellAtIndexPath(index, section)
    {
        this.selectedCellIndex = index;
        this.selectedCellSection = section;
        var cell = this._sections[section].cells[index];
        this._selectCell(cell);
    }

    _deselectCell(cell)
    {
        cell.setSelected(false);
    }

    deselectCellAtIndexPath(indexPath:MIOIndexPath)
    {
        this.selectedCellIndex = -1;
        this.selectedCellSection = -1;
        var cell = this._sections[indexPath.section].cells[indexPath.row];
        this._deselectCell(cell);
    }

    layoutSubviews() {                

        if (this.hidden == true) return;
        // if (this._needDisplay == false) return;
        // this._needDisplay = false;

        if (this._sections == null)
            return;        

        // var x = this.collectionViewLayout.sectionInset.left;
        // var y = this.collectionViewLayout.sectionInset.top;

        // TODO: Check margins
        var x = 0;
        var y = 0;

        for (var count = 0; count < this._sections.length; count++)
        {
            var section = this._sections[count];
            x = this.collectionViewLayout.sectionInset.left;

            // Add header view
            if (section.header != null)
            {
                section.header.setY(y);
                var offsetY = section.header.getHeight();
                if (offsetY <= 0) offsetY = 23;
                y += offsetY + this.collectionViewLayout.headerReferenceSize.height;
            }

            // Add cells
            let maxX = this.getWidth() - this.collectionViewLayout.sectionInset.right;
            for (var index = 0; index < section.cells.length; index++) {

                let cell = section.cells[index];
                if (this.delegate != null) {
                    if (typeof this.delegate.willDisplayCellAtIndexPath === "function")
                        this.delegate.willDisplayCellAtIndexPath(this, cell, index, count);
                }

                cell.setWidth(this.collectionViewLayout.itemSize.width);
                cell.setHeight(this.collectionViewLayout.itemSize.height);

                cell.setX(x);
                cell.setY(y);

                x += this.collectionViewLayout.itemSize.width + this.collectionViewLayout.minimumInteritemSpacing;                
                if (x >= maxX) {
                    x = this.collectionViewLayout.sectionInset.left;
                    y += this.collectionViewLayout.itemSize.height;
                }
            }

            y += this.collectionViewLayout.minimumLineSpacing;

            // Add footer view
            if (section.footer != null)
            {
                section.footer.setY(y);
                var offsetY = section.footer.getHeight();
                if (offsetY <= 0) offsetY = 23;
                y += offsetY + this.collectionViewLayout.footerReferenceSize.height;
            }
        }
    }

}