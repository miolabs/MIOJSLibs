/**
 * Created by godshadow on 22/3/16.
 */

/// <reference path="../MIOFoundation/MIOFoundation.ts" />

/// <reference path="MUIView.ts" />
/// <reference path="MUILabel.ts" />


enum MUITableViewCellStyle {

    Custom,
    Default
}

enum MUITableViewCellAccessoryType {

    None,
    DisclosureIndicator,
    DetailDisclosureButton,
    Checkmark
}

enum MIOTableViewCellEditingStyle {

    None,
    Delete,
    Insert
}

enum MUITableViewCellSeparatorStyle {

    None,
    SingleLine,
    SingleLineEtched // TODO 
}

enum MUITableViewCellSelectionStyle {
    
    None,
    Default
}

class MUITableViewCell extends MUIView {    

    contentView:MUIView = null;
    style = MUITableViewCellStyle.Custom;
    
    textLabel = null;
    
    accessoryType = MUITableViewCellAccessoryType.None;
    accessoryView = null;
    separatorStyle = MUITableViewCellSeparatorStyle.SingleLine;

    selectionStyle = MUITableViewCellSelectionStyle.Default;
    private _selected = false;    

    private _editing = false;
    editingAccessoryType = MUITableViewCellAccessoryType.None;    
    editingAccesoryView:MUIView = null;

    private _target = null;
    private _onClickFn = null;
    private _onDblClickFn = null;
    private _onAccessoryClickFn = null;
    private _row = 0;
    private _section = 0;

    initWithStyle(style: MUITableViewCellStyle) {
        
        super.init();
        this.style = style;

        if (style == MUITableViewCellStyle.Default) {
            this.textLabel = new MUILabel();
            this.textLabel.init();
            this.textLabel.layer.style.top = "";
            this.textLabel.layer.style.left = "";
            this.textLabel.layer.style.width = "";
            this.textLabel.layer.style.height = "";
            this.textLabel.layer.classList.add("tableviewcell_default_textlabel");
            this.addSubview(this.textLabel);
            this.layer.style.height = "44px";
        }

        this._setupLayer();
    }

    initWithLayer(layer, owner, options) {
        super.initWithLayer(layer, owner, options);

        this._setupLayer();
    }

    private _setupLayer() {
        this.layer.style.background = "";

        var instance = this;
        this.layer.classList.add("tableviewcell_deselected_color");

        this.layer.onclick = function () {
            if (instance._onClickFn != null)
                instance._onClickFn.call(instance._target, instance);
        };

        this.layer.ondblclick = function () {
            if (instance._onDblClickFn != null)
                instance._onDblClickFn.call(instance._target, instance);
        };
    }

    setAccessoryType(type) {
        if (type == this.accessoryType)
            return;

        if (this.accessoryView == null) {
            if (this.style == MUITableViewCellStyle.Default) this.textLabel.layer.style.right = "25px";

            var layer = document.createElement("div");
            layer.style.position = "absolute";
            layer.style.top = "15px";
            layer.style.right = "5px";
            layer.style.width = "15px";
            layer.style.height = "15px";

            this.accessoryView = new MUIView("accessory_view");
            this.accessoryView.initWithLayer(layer);

            this.addSubview(this.accessoryView);
        }

        // Remove the previous accessory
        if (this.accessoryType == MUITableViewCellAccessoryType.Checkmark)
            this.accessoryView.layer.classList.remove("tableviewcell_accessory_checkmark");
        else if (this.accessoryType == MUITableViewCellAccessoryType.DisclosureIndicator)
            this.accessoryView.layer.classList.remove("tableviewcell_accessory_disclosure_indicator");
        else if (this.accessoryType == MUITableViewCellAccessoryType.DetailDisclosureButton)
            this.accessoryView.layer.classList.remove("tableviewcell_accessory_detail_disclosure_button");            

        // Add the new one
        if (type == MUITableViewCellAccessoryType.Checkmark)
            this.accessoryView.layer.classList.add("tableviewcell_accessory_checkmark");
        else if (type == MUITableViewCellAccessoryType.DisclosureIndicator)
            this.accessoryView.layer.classList.add("tableviewcell_accessory_disclosure_indicator");
        else if (type == MUITableViewCellAccessoryType.DetailDisclosureButton)
            this.accessoryView.layer.classList.add("tableviewcell_accessory_detail_disclosure_button");            

        this.accessoryType = type;
    }

    setPaddingIndex(value) {

        var offset = (value + 1) * 10;
        if (this.style == MUITableViewCellStyle.Default) this.textLabel.setX(offset);
    }

    setHeight(h) {
        super.setHeight(h);

        var offsetY = (h - 15) / 2;

        if (this.accessoryView != null) {
            this.accessoryView.layer.style.top = offsetY + "px";
        }
    }

    setSelected(value) {
        
        this.willChangeValue("selected");
        this._selected = value;

        if (this.selectionStyle == MUITableViewCellSelectionStyle.Default) {
            if (value == true) {
                this.layer.classList.remove("tableviewcell_deselected_color");
                this.layer.classList.add("tableviewcell_selected_color");
            }
            else {
                this.layer.classList.remove("tableviewcell_selected_color");
                this.layer.classList.add("tableviewcell_deselected_color");
            }
            this._setHightlightedSubviews(value);
        }

        this.didChangeValue("selected");
    }

    set selected(value) {
        this.setSelected(value);
    }

    get selected() {
        return this._selected;
    }

    _setHightlightedSubviews(value) {
        for (var count = 0; count < this.subviews.length; count++) {
            var v = this.subviews[count];
            if (v instanceof MUILabel)
                v.setHightlighted(value);            
        }
        if (this.accessoryView == null) return;

        if (value == true) {

            switch(this.accessoryType){

                case MUITableViewCellAccessoryType.DisclosureIndicator:
                    this.accessoryView.layer.classList.remove("tableviewcell_accessory_disclosure_indicator");                    
                    this.accessoryView.layer.classList.add("tableviewcell_accessory_disclosure_indicator_highlighted");
                break;
            }
        }
        else {

            switch(this.accessoryType){

                case MUITableViewCellAccessoryType.DisclosureIndicator:
                    this.accessoryView.layer.classList.remove("tableviewcell_accessory_disclosure_indicator_highlighted");
                    this.accessoryView.layer.classList.add("tableviewcell_accessory_disclosure_indicator");
                break;
            }
            
        }

    }

    setEditing(editing, animated?){

        if (editing == this._editing) return;

        this._editing = editing;

        if (this.editingAccesoryView == null) {
            if (this.style == MUITableViewCellStyle.Default) this.textLabel.layer.style.left = "25px";

            var layer = document.createElement("div");
            layer.style.position = "absolute";

            var btn = new MUIView();
            btn.init();

            btn.layer.style.top = "";
            btn.layer.style.right = "";
            btn.layer.style.width = "";
            btn.layer.style.height = "100%";
            
            // TODO: Call delegate
            btn.layer.classList.add("tableviewcell_accessory_delete");

            var instance = this;
            btn.layer.onclick = function () {
            if (instance._onAccessoryClickFn != null)
                instance._onAccessoryClickFn.call(instance._target, instance);
            };

            this.editingAccesoryView = btn;
            this.addSubview(this.editingAccesoryView);
        }
        else 
        {
            this.editingAccesoryView.removeFromSuperview();
        }
        
    }

    set editing(value:boolean) {
        this.setEditing(value, false);
    }

    get isEditing():boolean {
        return this._editing;
    }
}

class MUITableViewSection extends MIOObject {
    header = null;
    cells = [];
}

class MUITableView extends MUIView {
    dataSource = null;
    delegate = null;

    sections = [];
    headerView = null;
    footerView = null;

    headerHeight = 0;
    footerHeight = 0;

    sectionHeaderHeight = 23;
    sectionFooterHeight = 23;

    allowsMultipleSelection = false;

    private selectedCellRow = -1;
    private selectedCellSection = -1;

    private _indexPathsForSelectedRows = [];

    private _cellPrototypesCount = 0;
    private _cellPrototypesDownloadedCount = 0;
    private _isDownloadingCells = false;
    private _needReloadData = false;
    private _cellPrototypes = {};

    private _reusableCells = {}
    private visibleCells = []

    initWithLayer(layer, owner, options?) {
        super.initWithLayer(layer, owner, options);

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
                else if (subLayer.getAttribute("data-tableview-header") != null) {
                    this._addHeaderWithLayer(subLayer);
                }
                else if (subLayer.getAttribute("data-tableview-footer") != null) {
                    this._addFooterWithLayer(subLayer);
                }
            }
        }
    }

    private _addHeaderWithLayer(subLayer) {
        this.headerView = new MUIView();
        this.headerView.initWithLayer(subLayer);
        // var h = this.headerView.getHeight();
        // var size = new MIOSize(subLayer.clientWidth, subLayer.clientHeight);
        // this.headerView.setFrame(MIOFrame.frameWithRect(0, 0, size.width, size.height));
    }

    private _addFooterWithLayer(subLayer) {
        this.footerView = new MUIView();
        this.footerView.initWithLayer(subLayer);
        // var size = new MIOSize(subLayer.clientWidth, subLayer.clientHeight);
        // this.footerView.setFrame(MIOFrame.frameWithRect(0, 0, size.width, size.height));
    }

    private _addCellPrototypeWithLayer(subLayer) {
        var cellIdentifier = subLayer.getAttribute("data-cell-identifier");
        var cellClassname = subLayer.getAttribute("data-class");
        if (cellClassname == null) cellClassname = "MUITableViewCell";

        var item = {};
        item["class"] = cellClassname;
        item["layer"] = subLayer;
        var size = new MIOSize(subLayer.clientWidth, subLayer.clientHeight);
        if (size != null) item["size"] = size;
        // var bg = window.getComputedStyle( subLayer ,null).getPropertyValue('background-color');
        // if (bg != null) item["bg"] = bg;

        this._cellPrototypes[cellIdentifier] = item;
    }

    addCellPrototypeWithIdentifier(identifier, elementID, url, classname?) {

        var item = {};

        this._isDownloadingCells = true;
        this._cellPrototypesCount++;

        item["url"] = url;
        item["id"] = elementID;
        if (classname != null)
            item["class"] = classname;

        this._cellPrototypes[identifier] = item;
        var mainBundle = MIOBundle.mainBundle();
        mainBundle.loadHTMLNamed(url, elementID, this, function (data) {

            var result = data;
            var cssFiles = result.styles;
            var baseURL = url.substring(0, url.lastIndexOf('/')) + "/";
            for (var index = 0; index < cssFiles.length; index++)
                MIOCoreLoadStyle(baseURL + cssFiles[index], null);

            var domParser = new DOMParser();
            var items = domParser.parseFromString(result.layout, "text/html");
            var layer = items.getElementById(elementID);

            //cell.localizeSubLayers(layer.childNodes);

            item["layer"] = layer;
            this._cellPrototypes[identifier] = item;

            this._cellPrototypesDownloadedCount++;
            if (this._cellPrototypesDownloadedCount == this._cellPrototypesCount) {
                this._isDownloadingCells = false;
                if (this._needReloadData)
                    this.reloadData();
            }

            /*            var cells = item["cells"];
                        if (cells != null)
                        {
                            for (var index = 0; index < cells.length; index++)
                            {
                                var cell = cells[index];
                                cell.addSubLayersFromLayer(layer.cloneNode(true));
                                cell.awakeFromHTML();
                            }
                        }
                        delete item["cells"];*/
        });
    }

    dequeueReusableCellWithIdentifier(identifier) {

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
            //newLayer.setAttribute("id", MUICoreLayerIDFromClassname(className));
            var size = item["size"];
            // if (size != null) {
            //     cell.setWidth(size.width);
            //     cell.setHeight(size.height);
            // }
            // var bg = item["bg"];
            // if (bg != null) {
            //     cell.layer.style.background = bg;
            // }
            cell.initWithLayer(newLayer);
            //cell._addLayerToDOM();
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

    setHeaderView(view) {
        this.headerView = view;
        this.addSubview(this.headerView);
    }

    reloadData() {
        // Remove all subviews
        for (var index = 0; index < this.sections.length; index++) {
            var sectionView = this.sections[index];
            if (sectionView.header != null)
                sectionView.header.removeFromSuperview();

            for (var count = 0; count < sectionView.cells.length; count++) {
                var cell = sectionView.cells[count];
                cell.removeObserver(this, "selected");
                cell.removeFromSuperview();

                if (this.delegate != null) {
                    if (typeof this.delegate.didEndDisplayingCellAtIndexPath === "function")
                        this.delegate.didEndDisplayingCellAtIndexPath(this, cell, index, section);
                }
            }
        }

        this.selectedCellRow = -1;
        this.selectedCellSection = -1;

        // Is ready to reaload or the are still donwloading
        if (this._isDownloadingCells == true) {
            this._needReloadData = true;
            return;
        }

        this.sections = [];
        this._indexPathsForSelectedRows = [];

        //if (this.dataSource == null) return;

        var sections = this.dataSource.numberOfSections(this);
        for (var sectionIndex = 0; sectionIndex < sections; sectionIndex++) {
            var section = new MUITableViewSection();
            section.init();
            this.sections.push(section);
            this._indexPathsForSelectedRows[sectionIndex] = [];

            var rows = this.dataSource.numberOfRowsInSection(this, sectionIndex);

            if (typeof this.dataSource.titleForHeaderInSection === "function" && rows > 0) {
                var title = this.dataSource.titleForHeaderInSection(this, sectionIndex);
                var header = new MUIView();
                header.init();
                header.setHeight(this.sectionHeaderHeight);
                header.layer.style.background = "";
                header.layer.classList.add("tableview_header");
                section.header = header;

                var titleLabel = new MUILabel();
                titleLabel.init();
                titleLabel.layer.style.background = "";
                titleLabel.layer.classList.add("tableview_header_title");
                titleLabel.text = title;
                header.addSubview(titleLabel);

                this.addSubview(header);
            }
            else if (typeof this.dataSource.viewForHeaderInSection === "function" && rows > 0) {
                var view = this.dataSource.viewForHeaderInSection(this, sectionIndex);
                if (view != null) {
                    section.header = view;
                    this.addSubview(view);
                }
            }

            for (var index = 0; index < rows; index++) {
                var cell = this.dataSource.cellAtIndexPath(this, index, sectionIndex);
                
                if (cell.selected) {
                    this.selectedCellRow = index;
                    this.selectedCellSection = sectionIndex;
                }
                
                cell.addObserver(this, "selected");
                section.cells.push(cell);
                this.addSubview(cell);

                cell._target = this;
                cell._onClickFn = this.cellOnClickFn;
                cell._onDblClickFn = this.cellOnDblClickFn;
                cell._onAccessoryClickFn = this.cellOnAccessoryClickFn;
                cell._row = index;
                cell._section = sectionIndex;
            }
        }

        this.setNeedsDisplay();
    }

    layout() {
        
        //super.layout();

        if (this._viewIsVisible == false) return;
        if (this.hidden == true) return;
        if (this._needDisplay == false) return;
        this._needDisplay = false;

        if (this.sections == null)
            return;

        var y = 0;
        var w = this.getWidth();

        if (this.headerView != null) {
            this.headerView.setY(y);

            if (this.headerHeight > 0) {
                this.headerView.setHeight(this.headerHeight);
                y += this.headerHeight;
            }
            else
                y += this.headerView.getHeight();
        }

        for (var count = 0; count < this.sections.length; count++) {
            var section = this.sections[count];

            if (section.header != null) {
                section.header.setY(y);
                var sh = section.header.getHeight();
                if (sh > 0) {
                    y += sh;
                }
                else {
                    section.header.setHeight(this.sectionHeaderHeight);
                    y += this.sectionHeaderHeight;
                }                    
            }

            for (var index = 0; index < section.cells.length; index++) {
                var h = 0;

                if (this.delegate != null) {
                    if (typeof this.delegate.heightForRowAtIndexPath === "function")
                        h = this.delegate.heightForRowAtIndexPath(this, index, section);
                }

                var cell = section.cells[index];
                if (this.delegate != null) {
                    if (typeof this.delegate.willDisplayCellAtIndexPath === "function")
                        this.delegate.willDisplayCellAtIndexPath(this, cell, index, section);
                }

                cell.setY(y);
                if (h > 0)
                    cell.setHeight(h);

                if (h == 0)
                    h = cell.getHeight();

                if (h == 0) {
                    h = 44;
                    cell.setHeight(h);
                }

                y += h;
                if (cell.separatorStyle == MUITableViewCellSeparatorStyle.SingleLine)
                    y += 1;
                else if (cell.separatorStyle == MUITableViewCellSeparatorStyle.SingleLineEtched)
                    y += 2;
                
                cell.layout();
            }
        }

        if (this.footerView != null) {
            this.footerView.setY(y);

            if (this.footerHeight > 0) {
                this.footerView.setHeight(this.footerHeight);
                y += this.footerHeight;
            }
            else
                y += this.footerView.getHeight() + 1;
        }

        this.layer.scrollHeight = y;
    }

    cellOnClickFn(cell) {
        var index = cell._row;
        var section = cell._section;

        var canSelectCell = true;

        if (!(this.selectedCellRow == index && this.selectedCellSection == section)) {

            if (this.delegate != null) {
                if (typeof this.delegate.canSelectCellAtIndexPath === "function")
                    canSelectCell = this.delegate.canSelectCellAtIndexPath(this, index, section);
            }

            if (canSelectCell == false)
                return;
            if (!this.allowsMultipleSelection) {
                if (this.selectedCellRow > -1 && this.selectedCellSection > -1)
                    this.deselectCellAtIndexPath(this.selectedCellRow, this.selectedCellSection);
            }

            this.selectedCellRow = index;
            this.selectedCellSection = section;

            this._selectCell(cell);
        }

        if (this.delegate != null) {
            if (typeof this.delegate.didSelectCellAtIndexPath === "function")
                this.delegate.didSelectCellAtIndexPath(this, index, section);
        }
    }

    cellOnDblClickFn(cell) {
        var index = cell._row;
        var section = cell._section;

        var canSelectCell = true;

        if (this.delegate != null) {
            if (typeof this.delegate.canSelectCellAtIndexPath === "function")
                canSelectCell = this.delegate.canSelectCellAtIndexPath(this, index, section);
        }

        if (canSelectCell == false)
            return;

        if (this.selectedCellRow == index && this.selectedCellSection == section) {

            if (this.delegate != null)
                if (typeof this.delegate.didMakeDoubleClick === "function")
                    this.delegate.didMakeDoubleClick(this, index, section);
            return;
        }

        if (this.selectedCellRow > -1 && this.selectedCellSection > -1)
            this.deselectCellAtIndexPath(this.selectedCellRow, this.selectedCellSection);

        this.selectedCellRow = index;
        this.selectedCellSection = section;

        this._selectCell(cell);

        if (this.delegate != null) {
            if (typeof this.delegate.didSelectCellAtIndexPath === "function")
                this.delegate.didSelectCellAtIndexPath(this, index, section);
        }

        if (this.delegate != null)
            if (typeof this.delegate.didMakeDoubleClick === "function")
                this.delegate.didMakeDoubleClick(this, index, section);
    }

    cellOnAccessoryClickFn(cell) {

        var index = cell._row;
        var section = cell._section;

        if (this.delegate != null) {
            if (typeof this.delegate.commitEditingStyleForRowAtIndexPath === "function")
                this.delegate.commitEditingStyleForRowAtIndexPath(this, MIOTableViewCellEditingStyle.Delete, index, section);
        }

    }

    cellAtIndexPath(row, section) {
        var s = this.sections[section];
        var c = s.cells[row];

        return c;
    }

    indexPathForCell(cell) {
        //TODO
        return null;
    }

    _selectCell(cell) {
        cell.setSelected(true);
    }

    selectCellAtIndexPath(row, section) {
        this.selectedCellRow = row;
        this.selectedCellSection = section;
        var cell = this.sections[section].cells[row];

        this._selectCell(cell);
    }

    _deselectCell(cell) {
        cell.setSelected(false);
    }

    deselectCellAtIndexPath(row, section) {
        this.selectedCellRow = -1;
        this.selectedCellSection = -1;
        var cell = this.sections[section].cells[row];
        this._deselectCell(cell);
    }

    selectNextIndexPath()
    {
        var sectionIndex = this.selectedCellSection;
        var rowIndex = this.selectedCellRow;

        if (sectionIndex == -1 && rowIndex == -1)
        {
            sectionIndex = 0;     
            rowIndex = 0;
        }
        else 
        {
            this.deselectCellAtIndexPath(rowIndex, sectionIndex);
            rowIndex++;
        }

        if (this.sections.length == 0) return;

        var section = this.sections[sectionIndex];
        if (rowIndex < section.cells.length)
        {
            this.selectCellAtIndexPath(rowIndex, sectionIndex);
        }
        else 
        {
            rowIndex = 0;
            sectionIndex++;
            if (sectionIndex < this.sections.length)
            {
                this.selectCellAtIndexPath(rowIndex, sectionIndex);
            }
        }
    }

    selectPrevIndexPath()
    {
        if (this.selectedCellSection == -1 && this.selectedCellRow == -1) return;    

        var sectionIndex = this.selectedCellSection;
        var rowIndex = this.selectedCellRow - 1;

        if (rowIndex > -1)
        {
            this.deselectCellAtIndexPath(rowIndex + 1, sectionIndex);
            this.selectCellAtIndexPath(rowIndex, sectionIndex);
        }        
        else 
        {
            sectionIndex--;
            if (sectionIndex > -1)
            {
                this.deselectCellAtIndexPath(rowIndex + 1, sectionIndex + 1);
                
                var section = this.sections[sectionIndex];
                rowIndex = section.cells.length - 1;
                
                this.selectCellAtIndexPath(rowIndex, sectionIndex);
            }            
        }
    }

}