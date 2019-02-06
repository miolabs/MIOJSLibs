import { MIOObject, MIOIndexPath, MIOLocationInRange, MIORange, MIOSize, MIOBundle, MIOUUID, MIOIndexPathEqual } from "../MIOFoundation";
import { MUIScrollView } from "./MUIScrollView";
import { MUIView } from "./MUIView";
import { MUITableViewCell, MUITableViewCellEditingStyle, MUITableViewCellAccessoryType } from "./MUITableViewCell";
import { MIOClassFromString, MIOCoreLoadStyle } from "../MIOCore/platform";
import { MUILabel } from "./MUILabel";
import { MUICoreLayerAddStyle, MUICoreLayerRemoveStyle } from ".";
import { MUIReportTableViewCell } from "./MUIReportTableView";

/**
 * Created by godshadow on 22/3/16.
 */

export interface MUITableViewDataSource {
    
    viewForHeaderInSection?(tableView:MUITableView, section):MUIView;
    titleForHeaderInSection?(tableView:MUITableView, section):string;
}

export enum UITableViewRowAnimation
{
    None,
    Automatic,
    Fade,
    Right,
    Left,
    Top,
    Bottom,
    Middle
}

export class MUITableViewSection extends MIOObject {
    header: MUIView = null;
    title: string = null;
    footer: MUIView = null;

    rowCount = 0;
    cells = [];
    rows = [];

    static headerWithTitle(title, height) {

        let header = new MUIView();
        header.init();
        header.setHeight(height);
        //header.layer.style.background = "";
        //header.layer.style.margin = "4px 8px";
        MUICoreLayerRemoveStyle(header.layer, "view");
        MUICoreLayerAddStyle(header.layer, "header");

        let titleLabel = new MUILabel();
        titleLabel.init();
        // titleLabel.layer.style.background = "";
        MUICoreLayerRemoveStyle(titleLabel.layer, "lbl");
        MUICoreLayerAddStyle(titleLabel.layer, "title");
        titleLabel.text = title;
        header.addSubview(titleLabel);

        return header;
    }
}

export enum MUITableViewRowType {
    Header,
    SectionHeader,
    Cell,
    SectionFooter,
    Footer
}

export class MUITableViewRow extends MIOObject {
    type: MUITableViewRowType;
    view: MUIView = null;
    height = 0;

    prevRow:MUITableViewRow = null;
    nextRow:MUITableViewRow = null;

    initWithType(type: MUITableViewRowType) {
        this.type = type;
    }
}

export class MUITableViewCellNode extends MIOObject {

    identifier: string = null;
    section: MUITableViewSection = null;
}

export class MUITableView extends MUIScrollView {
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

    visibleCells = [];
    private reusableCellsByID = {};    
    private cellNodesByID = {};

    private visibleRange: MIORange = new MIORange(-1, -1);

    private sections = [];
    private rows = [];
    private cellRows = [];
    private rowsCount = 0;

    private contentHeight = 0;
    private lastContentOffsetY = -this.defaultRowHeight;

    private firstVisibleHeader:MUIView = null;
    private reloadingData = false;
    private selectedCellWhileReloadingData:MUITableViewCell = null;

    initWithLayer(layer, owner, options?) {
        super.initWithLayer(layer, owner, options);

        // Check if we have prototypes
        if (this.layer.childNodes.length > 0) {
            for (let index = 0; index < this.layer.childNodes.length; index++) {
                let subLayer = this.layer.childNodes[index];

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
        let cellIdentifier = subLayer.getAttribute("data-cell-identifier");
        let cellClassname = subLayer.getAttribute("data-class");
        if (cellClassname == null) cellClassname = "MUITableViewCell";

        let item = {};
        item["class"] = cellClassname;
        item["layer"] = subLayer;
        let size = new MIOSize(subLayer.clientWidth, subLayer.clientHeight);
        if (size != null) item["size"] = size;
        // var bg = window.getComputedStyle( subLayer ,null).getPropertyValue('background-color');
        // if (bg != null) item["bg"] = bg;

        this._cellPrototypes[cellIdentifier] = item;
    }

    addCellPrototypeWithIdentifier(identifier, elementID, url, classname?) {

        let item = {};

        this._isDownloadingCells = true;
        this._cellPrototypesCount++;

        item["url"] = url;
        item["id"] = elementID;
        if (classname != null)
            item["class"] = classname;

        this._cellPrototypes[identifier] = item;
        let mainBundle = MIOBundle.mainBundle();
        mainBundle.loadHTMLNamed(url, elementID, this, function (layer) {

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

    dequeueReusableCellWithIdentifier(identifier:string): MUITableViewCell {

        let cell: MUITableViewCell = null;

        let array = this.reusableCellsByID[identifier];
        if (array != null) {
            if (array.length > 0) {
                cell = array[0];
                array.splice(0, 1);
                cell.addObserver(this, "selected");
                return cell;
            }
        }

        let item = this._cellPrototypes[identifier];

        //instance creation here
        let className = item["class"];
        cell = MIOClassFromString(className);
        cell.nodeID = MIOUUID.UUID().UUIDString;
        cell.reuseIdentifier = identifier;

        let layer = item["layer"];
        if (layer != null) {
            let newLayer = layer.cloneNode(true);
            newLayer.style.display = "";            
            cell.initWithLayer(newLayer, this);
            cell.awakeFromHTML();
        }
        // else {
        //     let cells = item["cells"];
        //     if (cells == null) {
        //         cells = [];
        //         item["cells"] = cells;
        //     }
        //     cells.push(cell);
        // }        

        cell.addObserver(this, "selected");
        return cell;
    }

    setHeaderView(view) {
        this.headerView = view;
        this.addSubview(this.headerView);
    }

    reloadData() {

        this.reloadingData = true;
        // Remove all subviews
        for (let index = 0; index < this.rows.length; index++) {
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

        let sections = 1;
        if (typeof this.dataSource.numberOfSections === "function") sections = this.dataSource.numberOfSections(this);
        for (let sectionIndex = 0; sectionIndex < sections; sectionIndex++) {
            let section = new MUITableViewSection();
            section.init();
            this.sections.push(section);

            let rows = this.dataSource.numberOfRowsInSection(this, sectionIndex);
            section.rowCount = rows;
            this.rowsCount += rows;
            this.contentHeight += rows * this.defaultRowHeight;
        }

        let size = new MIOSize(0, this.contentHeight);
        this.contentSize = size;        
        this.scrollToTop();

        this.reloadLayoutSubviews = true;

        if (this.rowsCount > 0) this.setNeedsDisplay();

        this.reloadingData = false;
        if (this.selectedCellWhileReloadingData != null) {
            let ip = this.indexPathForCell(this.selectedCellWhileReloadingData);
            this.selectedIndexPath = ip;
            this.selectedCellWhileReloadingData = null;
        }
        
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
    }

    private lastIndexPath: MIOIndexPath = null;

    private initialLayoutSubviews() {
        
        // Add Header
        let posY = this.addHeader();
        
        let maxY = this.getHeight() + (this.defaultRowHeight * 4);
        let exit = false;

        let lastRow = null;
        for (let sectionIndex = 0; sectionIndex < this.sections.length; sectionIndex++) {

            if (exit == true) break;            

            let section = this.sections[sectionIndex] as MUITableViewSection;
            if (section.rowCount > 0) posY += this.addSectionHeader(section, posY, null);           

            for (let cellIndex = 0; cellIndex < section.rowCount; cellIndex++) {
                let ip = MIOIndexPath.indexForRowInSection(cellIndex, sectionIndex);
                posY += this.addCell(ip, posY, null, lastRow);

                lastRow = this.rows[this.rows.length - 1];
                this.lastIndexPath = ip;

                if (cellIndex == section.rowCount - 1) posY += this.addSectionFooter(section, posY, null);

                if (posY >= maxY) {
                    exit = true;
                    break;
                }
            }            
        }

        // Add Footer
        if (posY < maxY) posY += this.addFooter();        

        this.visibleRange = new MIORange(0, this.rows.length);
        
        let size = new MIOSize(0, this.contentHeight);
        this.contentSize = size;
        this.lastContentOffsetY = 0;
    }

    private scrollLayoutSubviews() {

        if (this.rowsCount == 0) return;

        let scrollDown = false;
        let offsetY = 0;
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

            let start = this.visibleRange.location;
            let end = this.visibleRange.location + this.visibleRange.length - 1;
            let row = this.rows[end];
            let posY = row.view.getY() + row.height;
            let maxY = this.contentOffset.y + this.getHeight() + (this.defaultRowHeight * 4);
            let startSectionIndex = this.lastIndexPath.section;
            let startRowIndex = this.lastIndexPath.row + 1;

            let lastRow = row;
            let nextRow = end + 1;
            let h = 0;
            let exit = false;

            for (let sectionIndex = startSectionIndex; sectionIndex < this.sections.length; sectionIndex++) {

                if (exit == true) break;

                let section: MUITableViewSection = this.sections[sectionIndex];
                
                for (let cellIndex = startRowIndex; cellIndex < section.rowCount; cellIndex++) {

                    if (cellIndex == 0) {
                        h = this.addSectionHeader(section, posY, this.rows[nextRow]);
                        posY += h;
                        if (h > 0) {
                            nextRow++;
                            start++;
                        }
                    }

                    let ip = MIOIndexPath.indexForRowInSection(cellIndex, sectionIndex);
                    posY += this.addCell(ip, posY, this.rows[nextRow], lastRow);
                    lastRow = this.rows[nextRow];
                    nextRow++;
                    start++;                    

                    // let recycleRow:MUITableViewRow = this.rows[start];
                    // if (recycleRow.type == MUITableViewRowType.Cell) {
                    //     this.recycleCell(recycleRow.view as MUITableViewCell);                            
                    // }                        

                    this.lastIndexPath = ip;

                    if (section.rowCount - 1 == cellIndex) {
                        h = this.addSectionFooter(section, posY, this.rows[nextRow]);
                        posY += h;
                        if (h > 0) {
                            nextRow++;
                            start++;
                        } 
                    }

                    if (posY >= maxY) {
                        exit = true;
                        break;
                    }
                    
                }
                startRowIndex = 0;
                
            }

            // Add Footer
            // if (posY < maxY) {
            //     posY += this.addFooter();
            // }

            this.visibleRange = new MIORange(start, nextRow - start);
        }

        let size = new MIOSize(0, this.contentHeight);
        this.contentSize = size;
    }

    private recycleCell(cell: MUITableViewCell) {

        if (cell == null) return;

        let ip = this.indexPathForCell(cell);

        if (ip.row == -1) return;

        let section = this.sections[ip.section];
        section.cells[ip.row] = null;

        //cell.selected = false;
        cell.removeObserver(this, "selected");        

        let array = this.reusableCellsByID[cell.reuseIdentifier];
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

    private addRowsForNewVisibleRange(range: MIORange, scrollDown: boolean) {

        let row: MUITableViewRow;
        let start;
        let end;
        let posY = 0;

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

            for (let index = start; index < end; index++) {

                row = this.rows[index];
                if (MIOLocationInRange(index, this.visibleRange) == true) {
                    posY += row.height;
                }
                else {
                    // if (ip.row == 0) {
                    //     let section = this.sections[ip.section];
                    //     posY += this.addSectionHeader(section, posY, index);
                    // }

                    let ip = this.indexPathForRowIndex(index, 0);
                    posY += this.addCell(ip, posY, index, null);
                }
            }
        }
        else {

            for (let index = end; index >= start; index--) {

                if (MIOLocationInRange(index, this.visibleRange) == false) {

                    // if (rowIndex == section.rows - 1) {
                    //     section.header = this.addSectionHeader(sectionIndex);
                    // }
                    row = this.rows[index];
                    let h = row.height;
                    row = this.rows[index + 1];
                    posY = row.view.getY() - h;
                    let ip = this.indexPathForRowIndex(index, 0);
                    this.addCell(ip, posY, index, null, row);
                }
            }
        }
    }

    private addRowWithType(type: MUITableViewRowType, view: MUIView): MUITableViewRow {

        let row = new MUITableViewRow();
        row.initWithType(type);
        this.rows.push(row);
        this.cellRows.addObject(row);
        row.view = view;

        return row;
    }

    private addHeader() {

        let header:MUIView = null;
        if (this.headerView != null) header = this.headerView;
        if (header == null) return 0;

        header.setX(0);
        header.setY(0);
        header.setWidth(this.getWidth());

        this.addSubview(header);
        let row = this.addRowWithType(MUITableViewRowType.Header, header);

        if (row.height == 0) {
            row.height = header.getHeight() + 1;
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

    private addCell(indexPath: MIOIndexPath, posY, row: MUITableViewRow, prevRow:MUITableViewRow, currentRow?:MUITableViewRow) {

        let cell: MUITableViewCell = this.dataSource.cellAtIndexPath(this, indexPath);

        if (row != null && row.view != null) return row.height;
        let r = row;
        if (r == null) {
            r = this.addRowWithType(MUITableViewRowType.Cell, cell);
        }

        if (currentRow != null && prevRow != null){
            prevRow.nextRow = r;
            currentRow.prevRow = r;
            r.prevRow = prevRow;
            r.nextRow = currentRow;
        }
        else if (currentRow != null){
            r.nextRow = currentRow;
            r.prevRow = currentRow.prevRow;
            currentRow.prevRow = r;
        }
        else if (prevRow != null) {
            r.prevRow = prevRow;
            prevRow.nextRow = r;
        }

        let nodeID = cell.nodeID;
        let node: MUITableViewCellNode = this.cellNodesByID[nodeID];
        if (node == null) {
            node = new MUITableViewCellNode();
            node.identifier = nodeID;
            this.cellNodesByID[nodeID] = node;
        }

        let section = this.sections[indexPath.section];
        node.section = section;
        section.cells[indexPath.row] = cell;
        section.rows[indexPath.row] = r;

        cell.setX(0);
        cell.setY(posY);
        // TODO: Here we don't have to use the css. Encapsulate that in a Core Layer funciton
        //cell.layer.style.width = "100%";

        if (this.delegate != null && typeof this.delegate.willDisplayCellAtIndexPath === "function") {
            this.delegate.willDisplayCellAtIndexPath(this, cell, indexPath);
        }
        
        if (prevRow == null) {
            this.addSubview(cell);
        }
        else {
            let index = this.contentView.subviews.indexOf(prevRow.view);
            this.addSubview(cell, index)
        }

        r.view = cell;

        cell.setNeedsDisplay();

        //TODO: these are private properties, can not be used from outside
        cell._target = this;
        cell._onClickFn = this.cellOnClickFn;
        cell._onDblClickFn = this.cellOnDblClickFn;
        cell._onAccessoryClickFn = this.cellOnAccessoryClickFn;
        cell._onEditingAccessoryClickFn = this.cellOnEditingAccessoryClickFn;

        let h = this.rowHeight;
        if (this.delegate != null && typeof this.delegate.heightForRowAtIndexPath === "function") {
            h = this.delegate.heightForRowAtIndexPath(this, indexPath);
            if (r.height != h) {
                if (r.height == 0) {
                    this.contentHeight -= this.defaultRowHeight;
                    this.contentHeight += h; 
                }
                else {
                    this.contentHeight -= r.height;
                    this.contentHeight += h;                     
                }
                r.height = h;
            }
        }
        
        if (h > 0) {
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

        if (this.delegate != null && typeof this.delegate.editingStyleForRowAtIndexPath === "function") {
            let editingStyle = this.delegate.editingStyleForRowAtIndexPath(this, indexPath);
            cell.setEditingAccessoryType(editingStyle);
        }

        return r.height;
    }

    private addSectionFooter(section: MUITableViewSection, posY, row:MUITableViewRow) {
        
        if (row != null && row.type != MUITableViewRowType.SectionFooter) return 0;
        if (row != null && row.view != null) return row.height;

        let sectionIndex = this.sections.indexOf(section);

        if (typeof this.dataSource.viewForFooterInSection === "function") {
            let view: MUIView = this.dataSource.viewForFooterInSection(this, sectionIndex);
            if (view == null) return 0;

            view.setX(0);
            view.setY(posY);

            section.footer = view;
            this.addSubview(view);
            if (row == null) {
                row = this.addRowWithType(MUITableViewRowType.SectionFooter, section.footer);
            }
            row.view = view;

            if (row.height == 0) {
                row.height = view.getHeight();
                this.contentHeight += row.height;
            }

            return row.height;
        }

        return 0;
    }

    private addFooter() {
        return 0;
    }

    cellOnClickFn(cell: MUITableViewCell) {

        let indexPath: MIOIndexPath = this.indexPathForCell(cell);

        let canSelectCell = true;

        if (this.delegate != null) {
            if (typeof this.delegate.canSelectCellAtIndexPath === "function")
                canSelectCell = this.delegate.canSelectCellAtIndexPath(this, indexPath);
        }

        if (canSelectCell == false)
            return;

        if (this.allowsMultipleSelection == false) {                        
            cell.selected = true;
            if (this.delegate != null && typeof this.delegate.didSelectCellAtIndexPath === "function") {
                this.delegate.didSelectCellAtIndexPath(this, indexPath);
            }                
        }
        else {
            //TODO:
        }

    }

    cellOnDblClickFn(cell) {

/*        let indexPath: MIOIndexPath = this.indexPathForCell(cell);

        let canSelectCell = true;

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

        if (this.selectedIndexPath.isEqualToIndexPath(indexPath) == false) {

            if (this.allowsMultipleSelection == false) {
                if (this.selectedIndexPath != null)
                    this.deselectCellAtIndexPath(this.selectedIndexPath);
            }

            this.selectedIndexPath = indexPath;
            cell.selected = true;            
        }

        if (this.delegate != null) {
            if (typeof this.delegate.didSelectCellAtIndexPath === "function")
                this.delegate.didSelectCellAtIndexPath(this, indexPath);
        }*/
    }

    cellOnAccessoryClickFn(cell:MUITableViewCell) {
        if (cell.accessoryType != MUITableViewCellAccessoryType.None) return;

        let indexPath: MIOIndexPath = this.indexPathForCell(cell);
        if (this.delegate != null && typeof this.delegate.accessoryButtonTappedForRowWithIndexPath === "function") {
            this.delegate.accessoryButtonTappedForRowWithIndexPath(this, indexPath);
        }
    }

    cellOnEditingAccessoryClickFn(cell:MUITableViewCell) {
        let indexPath: MIOIndexPath = this.indexPathForCell(cell);

        if (this.delegate != null && typeof this.delegate.editingStyleForRowAtIndexPath === "function") {
            let editingStyle = this.delegate.editingStyleForRowAtIndexPath(this, indexPath);
        
            if (this.delegate != null && typeof this.delegate.commitEditingStyleForRowAtIndexPath === "function") {
                this.delegate.commitEditingStyleForRowAtIndexPath(this, editingStyle, indexPath);
            }
        }
    }


    cellAtIndexPath(indexPath: MIOIndexPath) {

        let s = this.sections[indexPath.section];
        let c = s.cells[indexPath.row];

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

    selectCellAtIndexPath(indexPath: MIOIndexPath) {

        if (this.selectedIndexPath.isEqualToIndexPath(indexPath) == true) return;

        //if (this.selectedIndexPath != null) this.deselectCellAtIndexPath(this.selectedIndexPath);
        //this.selectedIndexPath = indexPath;

        let cell = this.sections[indexPath.section].cells[indexPath.row];
        if (cell != null) cell.selected = true;
    }

    deselectCellAtIndexPath(indexPath: MIOIndexPath) {

        if (this.selectedIndexPath == null) return;
        if (this.selectedIndexPath.isEqualToIndexPath(indexPath) == false) return;

        //this.selectedIndexPath = null;
        let cell = this.sections[indexPath.section].cells[indexPath.row];
        if (cell != null) cell.selected = false;
    }

    observeValueForKeyPath(keyPath:string, type:string, object, ctx) {
        if (type != "did") return;
        if (keyPath == "selected") {
            let cell = object as MUITableViewCell;
            let indexPath = this.indexPathForCell(object);
            if (cell.selected == false && this.selectedIndexPath != null && this.selectedIndexPath.isEqualToIndexPath(indexPath) == true) {                
                this.selectedIndexPath = null;
            }
            else if (cell.selected == true){
                //TODO: Support multiple selection
                if (this.selectedIndexPath != null && this.selectedIndexPath.isEqualToIndexPath(indexPath) == false){
                    let oldCell = this.cellAtIndexPath(this.selectedIndexPath);
                    if (oldCell != null) oldCell.selected = false;
                }
                if (this.reloadingData == true) this.selectedCellWhileReloadingData = cell;
                this.selectedIndexPath = indexPath;
            }                                            
        }
    }


    insertRowsAtIndexPaths(indexPaths, animation:UITableViewRowAnimation){
               
        let rows = indexPaths.count;
        this.rowsCount += rows;
        this.contentHeight += rows * this.defaultRowHeight;

        let maxY = this.contentOffset.y + this.getHeight() + (this.defaultRowHeight * 4);

        for (let index = 0; index < rows; index++){
            let ip = indexPaths[index];

            this.insertCellWithIndexPath(ip);

            // if (posY >= maxY) {
            //     break;
            // }      
            
            this.lastIndexPath = ip;
        }

        //this.visibleRange = new MIORange(start, nextRow - start);
                
        let size = new MIOSize(0, this.contentHeight);
        this.contentSize = size;
    }

    private insertCellWithIndexPath(indexPath:MIOIndexPath){
        let section = this.sections[indexPath.section];        
        let prevRow = this.prevCellRowAtIndexPath(indexPath);

        let posY = 0;
        if (prevRow == null) {
            this.addCell(indexPath, posY, null, null);
        }
        else {            
            posY = prevRow.view.getY() + prevRow.view.getHeight();
            posY += this.addCell(indexPath, posY, null, prevRow, prevRow.nextRow);
        }

        // recalculate top of the cells
        if (prevRow == null) return;

        let nextRow = prevRow.nextRow.nextRow;
        while(nextRow != null) {
            nextRow.view.setY(posY);
            posY += nextRow.view.getHeight();
            nextRow = nextRow.nextRow;
        }
    }

    private prevIndexPath(indexPath:MIOIndexPath){
        let sectionIndex = indexPath.section;
        let rowIndex = indexPath.row - 1;

        if (rowIndex > -1) {
            return MIOIndexPath.indexForRowInSection(rowIndex, sectionIndex);            
        }
        else {
            sectionIndex--;
            if (sectionIndex > -1) {
                let section = this.sections[sectionIndex];
                rowIndex = section.cells.length - 1;

                return MIOIndexPath.indexForRowInSection(rowIndex, sectionIndex);
            }
        }

        return null;
    }

    private prevCellRowAtIndexPath(indexPath:MIOIndexPath){
        if (indexPath == null) return null;

        let ip = this.prevIndexPath(indexPath);
        if (ip == null) return null;

        let section = this.sections[ip.section];
        let row = section.rows[ip.row];

        return row;
    }

    deleteRowsAtIndexPaths(indexPaths, animation:UITableViewRowAnimation){

    }

    moveRowAtIndexPathToIndexPath(indexPath:MIOIndexPath, newIndexPat:MIOIndexPath){

    }

    selectNextIndexPath() {

        var sectionIndex = 0;
        var rowIndex = 0;

        if (this.selectedIndexPath != null) {
            sectionIndex = this.selectedIndexPath.section;
            rowIndex = this.selectedIndexPath.row;    

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