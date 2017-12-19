/**
 * Created by godshadow on 22/3/16.
 */

/// <reference path="../MIOFoundation/MIOFoundation.ts" />

/// <reference path="MUIScrollView.ts" />
/// <reference path="MUILabel.ts" />

/// <reference path="MUITableViewCell.ts" />

class MUITableViewSection extends MIOObject {
    header: MUIView = null;
    title: String = null;

    rows = 0;
    cells = [];

    static headerWithTitle(title, height) {

        var header = new MUIView();
        header.init();
        header.setHeight(height);
        header.layer.style.background = "";
        header.layer.classList.add("tableview_header");

        var titleLabel = new MUILabel();
        titleLabel.init();
        titleLabel.layer.style.background = "";
        titleLabel.layer.classList.add("tableview_header_title");
        titleLabel.text = title;
        header.addSubview(titleLabel);

        return header;
    }
}

enum MUITableViewRowType {
    Header,
    SectionHeader,
    Cell,
    SectionFooter,
    Footer
}

class MUITableViewRow extends MIOObject {
    type: MUITableViewRowType;
    view: MUIView = null;
    height = 0;

    initWithType(type: MUITableViewRowType) {
        this.type = type;
    }
}

class MUITableViewCellNode extends MIOObject {

    identifier: String = null;
    section: MUITableViewSection = null;
}

class MUITableView extends MUIScrollView {
    dataSource = null;
    delegate = null;

    headerView: MUIView = null;
    footerView: MUIView = null;

    headerHeight = 0;
    footerHeight = 0;

    sectionHeaderHeight = 23;
    sectionFooterHeight = 23;

    rowHeight = 0;
    private defaultRowHeight = 44;

    allowsMultipleSelection = false;

    private selectedIndexPath: MIOIndexPath = null;

    private _indexPathsForSelectedRows = [];

    private _cellPrototypesCount = 0;
    private _cellPrototypesDownloadedCount = 0;
    private _isDownloadingCells = false;
    private _needReloadData = false;
    private _cellPrototypes = {};

    private reusableCellsByID = {};
    private visibleCells = [];
    private cellNodesByID = {};

    private visibleRange: MIORange = new MIORange(-1, -1);

    private sections = [];
    private rows = [];
    private rowsCount = 0;

    private contentHeight = 0;
    private lastContentOffsetY = -this.defaultRowHeight;

    initWithLayer(layer, owner, options?) {
        super.initWithLayer(layer, owner, options);

        // Check if we have prototypes
        if (this.layer.childNodes.length > 0) {
            for (var index = 0; index < this.layer.childNodes.length; index++) {
                var subLayer = this.layer.childNodes[index];

                if (subLayer.tagName != "DIV")
                    continue;

                if (subLayer.getAttribute("data-cell-identifier") != null) {
                    this._addCellPrototypeWithLayer(subLayer, owner);
                    subLayer.style.display = "none";
                }
                else if (subLayer.getAttribute("data-tableview-header") != null) {
                    this._addHeaderWithLayer(subLayer, owner);
                }
                else if (subLayer.getAttribute("data-tableview-footer") != null) {
                    this._addFooterWithLayer(subLayer, owner);
                }
            }
        }
    }

    private _addHeaderWithLayer(subLayer, owner) {
        this.headerView = new MUIView();
        this.headerView.initWithLayer(subLayer, owner);
        // var h = this.headerView.getHeight();
        // var size = new MIOSize(subLayer.clientWidth, subLayer.clientHeight);
        // this.headerView.setFrame(MIOFrame.frameWithRect(0, 0, size.width, size.height));
    }

    private _addFooterWithLayer(subLayer, owner) {
        this.footerView = new MUIView();
        this.footerView.initWithLayer(subLayer, owner);
        // var size = new MIOSize(subLayer.clientWidth, subLayer.clientHeight);
        // this.footerView.setFrame(MIOFrame.frameWithRect(0, 0, size.width, size.height));
    }

    private _addCellPrototypeWithLayer(subLayer, owner) {
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
        });
    }

    dequeueReusableCellWithIdentifier(identifier): MUITableViewCell {

        var cell: MUITableViewCell = null;

        var array = this.reusableCellsByID[identifier];
        if (array != null) {
            if (array.length > 0) {
                cell = array[0];
                array.splice(0, 1);
                return cell;
            }
        }

        var item = this._cellPrototypes[identifier];

        //instance creation here
        var className = item["class"];
        cell = Object.create(window[className].prototype);
        cell.constructor.apply(cell);
        cell.nodeID = MIOUUID.uuid();
        cell.reuseIdentifier = identifier;

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
        for (var index = 0; index < this.rows.length; index++) {
            let row = this.rows[index];
            if (row.view != null) {
                switch (row.type) {

                    case MUITableViewRowType.Header:
                    case MUITableViewRowType.Footer:                    
                        break;

                    case MUITableViewRowType.Cell:
                        this.recycleCell(row.view);
                        row.view.removeFromSuperview();                        
                        break;

                    default:
                        row.view.removeFromSuperview();
                }                
            }
        }

        this.rows = [];
        this.sections = [];
        this.rowsCount = 0;
        this.selectedIndexPath = null;
        this.visibleRange = new MIORange(-1, -1);
        //this.lastContentOffsetY = -this.defaultRowHeight;
        this.lastContentOffsetY = 0;
        this.contentHeight = 0;

        // Is ready to reaload or the are still donwloading
        if (this._isDownloadingCells == true) {
            this._needReloadData = true;
            return;
        }

        if (this.dataSource == null) return;

        var sections = this.dataSource.numberOfSections(this);
        for (var sectionIndex = 0; sectionIndex < sections; sectionIndex++) {
            var section = new MUITableViewSection();
            section.init();
            this.sections.push(section);

            let rows = this.dataSource.numberOfRowsInSection(this, sectionIndex);
            section.rows = rows;
            this.rowsCount += rows;
            this.contentHeight += rows * this.defaultRowHeight;
        }

        let size = new MIOSize(this.getWidth(), this.contentHeight);
        this.contentSize = size;        
        this.scrollToTop();

        this.reloadLayoutSubviews = true;

        MIOLog("ROW COUNT: " + this.rowsCount);
        MIOLog("SIZE HEIGHT: " + this.contentHeight);
        if (this.rowsCount > 0) this.setNeedsDisplay();
    }

    private reloadLayoutSubviews = false;

    layoutSubviews() {

        if (this.reloadLayoutSubviews == true) {
            this.reloadLayoutSubviews = false;
            this.initialLayoutSubviews();
        }
        else {
            this.scrollLayoutSubviews();
        }

        // if (this.contentHeight < this.getHeight()) {
        //     this.contentHeight = this.getHeight();
        //     let size = new MIOSize(this.getWidth(), this.contentHeight);
        //     MIOLog("SIZE: " + this.contentHeight);
        //     this.contentSize = size;
        // }
    }

    private lastIndexPath: MIOIndexPath = null;

    private initialLayoutSubviews() {

        if (this.rowsCount == 0) return;

        // Add Header
        let posY = this.addHeader();
        let maxY = this.getHeight() + (this.defaultRowHeight * 2);

        var exit = false;

        for (var sectionIndex = 0; sectionIndex < this.sections.length; sectionIndex++) {

            if (exit == true) break;

            var section: MUITableViewSection = this.sections[sectionIndex];
            posY += this.addSectionHeader(section, posY, null);

            for (var cellIndex = 0; cellIndex < section.rows; cellIndex++) {
                console.log("-- ROW: " + this.rows.length + " POS Y: " + posY);
                let ip = MIOIndexPath.indexForRowInSection(cellIndex, sectionIndex);
                posY += this.addCell(ip, posY, null);

                this.lastIndexPath = ip;
                if (posY >= maxY) {
                    exit = true;
                    break;
                }
            }

            //posY += this.addSectionFooter(section, posY, this.rows.length - 1);
        }

        // Add Footer
        if (posY < maxY) {
            posY += this.addFooter();
        }

        this.visibleRange = new MIORange(0, this.rows.length);

        let size = new MIOSize(this.getWidth(), this.contentHeight);
        this.contentSize = size;
        this.lastContentOffsetY = 0;
    }

    private scrollLayoutSubviews() {

        if (this.rowsCount == 0) return;

        var scrollDown = false;
        var offsetY = 0;
        if (this.contentOffset.y == this.lastContentOffsetY) return;
        if (this.contentOffset.y > this.lastContentOffsetY) {
            offsetY = this.contentOffset.y - this.lastContentOffsetY;
            scrollDown = true;
        }
        else if (this.contentOffset.y < this.lastContentOffsetY) {
            offsetY = this.lastContentOffsetY - this.contentOffset.y;
            scrollDown = false;
        }

        if (offsetY < (this.defaultRowHeight / 2)) return;
        this.lastContentOffsetY = this.contentOffset.y;

        if (scrollDown == true) {

            var start = this.visibleRange.location;
            var end = this.visibleRange.location + this.visibleRange.length - 1;
            var row = this.rows[end];
            var posY = row.view.getY() + row.height;
            let maxY = this.contentOffset.y + this.getHeight() + (this.defaultRowHeight * 2);
            let startSectionIndex = this.lastIndexPath.section;
            var startRowIndex = this.lastIndexPath.row + 1;

            var nextRow = end + 1;
            MIOLog("** Start row: " + nextRow + " (" + startSectionIndex + ", " + startRowIndex + ")");
            var h = 0;
            var exit = false;

            if (nextRow == 23) {
                MIOLog("??");
            }

            for (var sectionIndex = startSectionIndex; sectionIndex < this.sections.length; sectionIndex++) {

                if (exit == true) break;

                var section: MUITableViewSection = this.sections[sectionIndex];
                h = this.addSectionHeader(section, posY, this.rows[nextRow]);
                posY += h;
                if (h > 0) {
                    nextRow++;
                    start++;
                }

                for (var cellIndex = startRowIndex; cellIndex < section.rows; cellIndex++) {
                    MIOLog("-> ROW: " + nextRow + " POS Y: " + posY);
                    let ip = MIOIndexPath.indexForRowInSection(cellIndex, sectionIndex);
                    posY += this.addCell(ip, posY, this.rows[nextRow]);
                    nextRow++;
                    start++;

                    // let recycleRow:MUITableViewRow = this.rows[start];
                    // if (recycleRow.type == MUITableViewRowType.Cell) {
                    //     this.recycleCell(recycleRow.view as MUITableViewCell);                            
                    // }                        

                    this.lastIndexPath = ip;
                    MIOLog("<- Row: " + this.lastIndexPath.row + " Section: " + this.lastIndexPath.section);

                    if (posY >= maxY) {
                        exit = true;
                        break;
                    }
                }
                startRowIndex = 0;

                //posY += this.addSectionFooter(section, posY, this.rows.length - 1);
            }

            // Add Footer
            // if (posY < maxY) {
            //     posY += this.addFooter();
            // }

            this.visibleRange = new MIORange(start, nextRow - start);
        }


        // Title cells
        // let range = this.rangeForVisibleCells();
        // if (MIOEqualRanges(range, this.visibleRange) == true) return;

        // this.recycleRowsForNewVisibleRange(range, scrollDown);
        // this.addRowsForNewVisibleRange(range, scrollDown);
        // this.visibleRange = range;

        let size = new MIOSize(this.getWidth(), this.contentHeight);
        this.contentSize = size;

        MIOLog("----------------------------------------");
    }

    private rangeForVisibleCells() {

        let visibleBounds: MIORect = this.bounds;

        var firstIndex = Math.floor(MIORectMaxY(visibleBounds) / this.defaultRowHeight) - 1;
        var lastIndex = Math.floor(MIORectMinY(visibleBounds) / this.defaultRowHeight) + 1;
        firstIndex = Math.max(firstIndex, 0);
        lastIndex = Math.min(lastIndex, this.rowsCount - 1);

        let visibleRange = new MIORange(firstIndex, lastIndex - firstIndex + 1);
        return visibleRange;
    }

    private recycleRowsForNewVisibleRange(range: MIORange, scrollDown: Boolean) {

        if (this.visibleRange.location == -1) return;

        var row;
        var start;
        var end;

        if (scrollDown == true) {
            // First visible row
            row = this.rows[this.visibleRange.location];
            start = this.visibleRange.location;
            end = range.location;
        }
        else {
            // Last visible row
            row = this.rows[this.visibleRange.location + this.visibleRange.length - 1];
            start = range.location + range.length - 1;
            end = this.visibleRange.location + this.visibleRange.length;
        }

        for (var index = start; index < end; index++) {

            if (MIOLocationInRange(index, range) == true) continue;

            let row = this.rows[index];
            if (row.type == MUITableViewRowType.Cell) {
                this.recycleCell(row.view);
                row.view = null;
            }
            else if (row.type == MUITableViewRowType.SectionHeader || row.type == MUITableViewRowType.SectionFooter) {
                row.view = null;
            }
        }
    }

    private recycleCell(cell: MUITableViewCell) {

        if (cell == null) return;

        let ip = this.indexPathForCell(cell);

        if (ip.row == -1) return;

        var section = this.sections[ip.section];
        section.cells[ip.row] = null;

        cell.removeObserver(this, "selected");

        var array = this.reusableCellsByID[cell.reuseIdentifier];
        if (array == null) {
            array = [];
            this.reusableCellsByID[cell.reuseIdentifier] = array;
        }
        array.push(cell);

        if (this.delegate != null) {
            if (typeof this.delegate.didEndDisplayingCellAtIndexPath === "function")
                this.delegate.didEndDisplayingCellAtIndexPath(this, cell, ip);
        }
    }

    private indexPathForRowIndex(index, sectionIndex) {

        let section = this.sections[sectionIndex];

        if (index < section.rows) {
            return MIOIndexPath.indexForRowInSection(index, sectionIndex);
        }
        else {
            let nextIndex = index - section.rows;
            return this.indexPathForRowIndex(nextIndex, sectionIndex + 1);
        }
    }

    private addRowsForNewVisibleRange(range: MIORange, scrollDown: Boolean) {

        var row: MUITableViewRow;
        var start;
        var end;
        var posY = 0;

        if (this.visibleRange.location == -1) {
            start = range.location;
            end = range.length;
            posY = 0;
        }
        else if (scrollDown == true) {
            start = this.visibleRange.location + this.visibleRange.length - 1;
            end = range.location + range.length;
        }
        else {
            start = range.location;
            end = this.visibleRange.location;
            row = this.rows[end];
            posY = row.view.getY();
        }

        if (scrollDown == true) {

            row = this.rows[start];
            posY = row.view.getY();

            for (var index = start; index < end; index++) {

                row = this.rows[index];
                if (MIOLocationInRange(index, this.visibleRange) == true) {
                    posY += row.height;
                }
                else {
                    // if (ip.row == 0) {
                    //     let section = this.sections[ip.section];
                    //     posY += this.addSectionHeader(section, posY, index);
                    // }

                    console.log("-- ROW: " + index + " POS Y: " + posY);
                    let ip = this.indexPathForRowIndex(index, 0);
                    posY += this.addCell(ip, posY, index);
                }
            }
        }
        else {

            for (var index = end; index >= start; index--) {

                if (MIOLocationInRange(index, this.visibleRange) == false) {

                    // if (rowIndex == section.rows - 1) {
                    //     section.header = this.addSectionHeader(sectionIndex);
                    // }
                    row = this.rows[index];
                    let h = row.height;
                    row = this.rows[index + 1];
                    posY = row.view.getY() - h;
                    let ip = this.indexPathForRowIndex(index, 0);
                    console.log("-- ROW: " + index + " POS Y: " + posY + " IP.row: " + ip.row);
                    this.addCell(ip, posY, index, row.view);
                }
            }
        }
    }

    private addRowWithType(type: MUITableViewRowType, view: MUIView): MUITableViewRow {

        var row = new MUITableViewRow();
        row.initWithType(type);
        this.rows.push(row);
        row.view = view;

        return row;
    }

    private addHeader() {

        let header = null;
        if (this.headerView != null) header = this.headerView;
        if (header == null) return 0;

        header.setX(0);
        header.setY(0);
        header.setWidth(this.getWidth());

        this.addSubview(header);
        let row = this.addRowWithType(MUITableViewRowType.Header, header);

        if (row.height == 0) {
            row.height = header.getHeight();
            this.contentHeight += row.height;
        }

        return row.height;
    }

    private addSectionHeader(section: MUITableViewSection, posY, row: MUITableViewRow) {

        if (row != null && row.view != null) return row.height;

        let sectionIndex = this.sections.indexOf(section);

        if (typeof this.dataSource.viewForHeaderInSection === "function") {
            let view: MUIView = this.dataSource.viewForHeaderInSection(this, sectionIndex);
            if (view == null) return 0;

            view.setX(0);
            view.setY(posY);

            section.header = view;
            this.addSubview(view);
            if (row == null) {
                row = this.addRowWithType(MUITableViewRowType.SectionHeader, section.header);
            }
            row.view = view;

            if (row.height == 0) {
                row.height = view.getHeight();;
                this.contentHeight += row.height;
            }

            return row.height;
        }
        else if (typeof this.dataSource.titleForHeaderInSection === "function") {
            let title = this.dataSource.titleForHeaderInSection(this, sectionIndex);
            if (title == null) return null;

            let header = MUITableViewSection.headerWithTitle(title, this.sectionHeaderHeight);

            header.setX(0);
            header.setY(posY);

            section.header = header;
            this.addSubview(header);

            if (row == null) {
                row = this.addRowWithType(MUITableViewRowType.SectionHeader, section.header);
            }
            row.view = header;

            if (row.height == 0) {
                row.height = header.getHeight();;
                this.contentHeight += row.height;
            }

            return row.height;
        }

        return 0;
    }

    private addCell(indexPath: MIOIndexPath, posY, row: MUITableViewRow, previusCell?: MUIView) {

        if (row != null && row.view != null) return row.height;
        var r = row;
        if (r == null) {
            r = this.addRowWithType(MUITableViewRowType.Cell, cell);
        }

        var cell: MUITableViewCell = this.dataSource.cellAtIndexPath(this, indexPath);

        let nodeID = cell.nodeID;
        var node: MUITableViewCellNode = this.cellNodesByID[nodeID];
        if (node == null) {
            node = new MUITableViewCellNode();
            node.identifier = nodeID;
            this.cellNodesByID[nodeID] = node;
        }

        let section = this.sections[indexPath.section];
        node.section = section;
        section.cells[indexPath.row] = cell;

        cell.setX(0);
        cell.setY(posY);

        if (typeof this.delegate.willDisplayCellAtIndexPath === "function") {
            this.delegate.willDisplayCellAtIndexPath(this, cell, indexPath);
        }

        cell.addObserver(this, "selected");
        if (previusCell == null) {
            this.addSubview(cell);
        }
        else {
            let index = this.contentView.subviews.indexOf(previusCell);
            this.addSubview(cell, index)
        }

        r.view = cell;

        cell.setNeedsDisplay();

        cell._target = this;
        cell._onClickFn = this.cellOnClickFn;
        cell._onDblClickFn = this.cellOnDblClickFn;
        cell._onAccessoryClickFn = this.cellOnAccessoryClickFn;

        var h = this.rowHeight;
        if (typeof this.delegate.heightForRowAtIndexPath === "function") {
            h = this.delegate.heightForRowAtIndexPath(this, indexPath);
        }
        else if (h > 0) {
            cell.setHeight(h);
        }
        else {
            h = cell.getHeight();
            if (r.height == 0) {
                r.height = h;
                this.contentHeight -= this.defaultRowHeight;
                this.contentHeight += h;
            }
        }

        return r.height;
    }

    private addSectionFooter(section: MUITableViewSection, posY, rowIndex) {

        return 0;
    }


    private addFooter() {
        return 0;
    }

    layout2() {

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

    cellOnClickFn(cell: MUITableViewCell) {

        let indexPath: MIOIndexPath = this.indexPathForCell(cell);

        var canSelectCell = true;

        if (this.delegate != null) {
            if (typeof this.delegate.canSelectCellAtIndexPath === "function")
                canSelectCell = this.delegate.canSelectCellAtIndexPath(this, indexPath);
        }

        if (canSelectCell == false)
            return;

        if (MIOIndexPathEqual(this.selectedIndexPath, indexPath) == false) {

            if (this.allowsMultipleSelection == false) {
                if (this.selectedIndexPath != null)
                    this.deselectCellAtIndexPath(this.selectedIndexPath);
            }

            this.selectedIndexPath = indexPath;

            this._selectCell(cell);
        }

        if (this.delegate != null) {
            if (typeof this.delegate.didSelectCellAtIndexPath === "function")
                this.delegate.didSelectCellAtIndexPath(this, indexPath);
        }
    }

    cellOnDblClickFn(cell) {

        let indexPath: MIOIndexPath = this.indexPathForCell(cell);

        var canSelectCell = true;

        if (this.delegate != null) {
            if (typeof this.delegate.canSelectCellAtIndexPath === "function")
                canSelectCell = this.delegate.canSelectCellAtIndexPath(this, indexPath);
        }

        if (canSelectCell == false)
            return;

        if (this.delegate != null) {
            if (typeof this.delegate.didMakeDoubleClick === "function")
                this.delegate.didMakeDoubleClick(this, indexPath);
        }

        if (MIOIndexPathEqual(this.selectedIndexPath, indexPath) == false) {

            if (this.allowsMultipleSelection == false) {
                if (this.selectedIndexPath != null)
                    this.deselectCellAtIndexPath(this.selectedIndexPath);
            }

            this.selectedIndexPath = indexPath;

            this._selectCell(cell);
        }

        if (this.delegate != null) {
            if (typeof this.delegate.didSelectCellAtIndexPath === "function")
                this.delegate.didSelectCellAtIndexPath(this, indexPath);
        }
    }

    cellOnAccessoryClickFn(cell) {

        let indexPath: MIOIndexPath = this.indexPathForCell(cell);

        if (this.delegate != null) {
            if (typeof this.delegate.commitEditingStyleForRowAtIndexPath === "function")
                this.delegate.commitEditingStyleForRowAtIndexPath(this, MIOTableViewCellEditingStyle.Delete, indexPath);
        }
    }

    cellAtIndexPath(indexPath: MIOIndexPath) {

        var s = this.sections[indexPath.section];
        var c = s.cells[indexPath.row];

        return c;
    }

    indexPathForCell(cell: MUITableViewCell): MIOIndexPath {

        let node: MUITableViewCellNode = this.cellNodesByID[cell.nodeID];
        if (node == null) return null;

        let section = node.section;
        let sectionIndex = this.sections.indexOf(section);

        let rowIndex = section.cells.indexOf(cell);

        return MIOIndexPath.indexForRowInSection(rowIndex, sectionIndex);
    }

    _selectCell(cell) {
        cell.setSelected(true);
    }

    selectCellAtIndexPath(indexPath: MIOIndexPath) {

        if (MIOIndexPathEqual(this.selectedIndexPath, indexPath) == true) return;

        this.selectedIndexPath = indexPath;
        var cell = this.sections[indexPath.section].cells[indexPath.row];
        if (cell != null) {
            this._selectCell(cell);
        }
    }

    _deselectCell(cell) {
        cell.setSelected(false);
    }

    deselectCellAtIndexPath(indexPath: MIOIndexPath) {

        if (MIOIndexPathEqual(this.selectedIndexPath, indexPath) == false) return;

        this.selectedIndexPath = null;
        var cell = this.sections[indexPath.section].cells[indexPath.row];
        this._deselectCell(cell);
    }

    selectNextIndexPath() {

        var sectionIndex = this.selectedIndexPath.section;
        var rowIndex = this.selectedIndexPath.row;

        if (sectionIndex == -1 && rowIndex == -1) {
            sectionIndex = 0;
            rowIndex = 0;
        }
        else {
            let ip = MIOIndexPath.indexForRowInSection(rowIndex, sectionIndex);
            this.deselectCellAtIndexPath(ip);
            rowIndex++;
        }

        if (this.sections.length == 0) return;

        var section = this.sections[sectionIndex];
        if (rowIndex < section.cells.length) {
            let ip = MIOIndexPath.indexForRowInSection(rowIndex, sectionIndex);
            this.selectCellAtIndexPath(ip);
        }
        else {
            rowIndex = 0;
            sectionIndex++;
            if (sectionIndex < this.sections.length) {
                let ip = MIOIndexPath.indexForRowInSection(rowIndex, sectionIndex);
                this.selectCellAtIndexPath(ip);
            }
        }
    }

    selectPrevIndexPath() {

        if (this.selectedIndexPath == null) return;

        var sectionIndex = this.selectedIndexPath.section;
        var rowIndex = this.selectedIndexPath.row - 1;

        if (rowIndex > -1) {
            let ip = MIOIndexPath.indexForRowInSection(rowIndex + 1, sectionIndex);
            this.deselectCellAtIndexPath(ip);
            let ip2 = MIOIndexPath.indexForRowInSection(rowIndex, sectionIndex);
            this.selectCellAtIndexPath(ip2);
        }
        else {
            sectionIndex--;
            if (sectionIndex > -1) {
                let ip = MIOIndexPath.indexForRowInSection(rowIndex + 1, sectionIndex + 1);
                this.deselectCellAtIndexPath(ip);

                var section = this.sections[sectionIndex];
                rowIndex = section.cells.length - 1;

                let ip2 = MIOIndexPath.indexForRowInSection(rowIndex, sectionIndex);
                this.selectCellAtIndexPath(ip2);
            }
        }
    }

}