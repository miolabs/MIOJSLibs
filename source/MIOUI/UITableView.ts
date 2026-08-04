import { MUIView , UITableViewCell, MUIGestureRecognizer, MUITapGestureRecognizer, MUIGestureRecognizerState, UITableViewCellEditingStyle} from ".";
import { MIOUUID, MIOIndexPath, MIOIndexPathEqual } from "../MIOFoundation";
import { MIOClassFromString } from "../MIOCore/platform/Web";
import { MUILayerGetFirstElementWithTag, MUILayerSearchElementByAttribute } from "./MUIView";
import { MUICoreLayerRemoveStyle, MUICoreLayerAddStyle } from "./MIOUI_CoreLayer";
import { MUILabel } from "./MUILabel";
import { UIScrollView, UIScrollViewDelegate } from "./UIScrollView";
import { UIEdgeInsets } from "./UIEdgeInsets";


export interface UITableViewDelegate extends UIScrollViewDelegate
{
    heightForRowAtIndexPath?(tableView:UITableView, indexPath:MIOIndexPath):number;
    heightForHeaderInSection?(tableView:UITableView, section:number):number;
    heightForFooterInSection?(tableView:UITableView, section:number):number;

    viewForHeaderInSection?(tableView:UITableView, section:number):MUIView;
    viewForFooterInSection?(tableView:UITableView, section:number):MUIView;

    didSelectCellAtIndexPath?(tableView:UITableView, indexPath:MIOIndexPath);
    didDeselectCellAtIndexPath?(tableView:UITableView, indexPath:MIOIndexPath);

    canSelectCellAtIndexPath?(tableView:UITableView, indexPath:MIOIndexPath):boolean;

    editingStyleForRowAtIndexPath?(tableView:UITableView, indexPath:MIOIndexPath):UITableViewCellEditingStyle;
    commitEditingStyleForRowAtIndexPath?(tableView:UITableView, editingStyle:UITableViewCellEditingStyle, indexPath:MIOIndexPath);

    targetIndexPathForMoveFromRowAtIndexPath?(tableView:UITableView, fromIndexPath:MIOIndexPath, proposedIndexPath:MIOIndexPath):MIOIndexPath;
}

// Reordering data source methods (optional, checked dynamically like the rest of the data source):
//   canMoveRowAtIndexPath(tableView:UITableView, indexPath:MIOIndexPath):boolean
//   moveRowAtIndexPath(tableView:UITableView, fromIndexPath:MIOIndexPath, toIndexPath:MIOIndexPath)

export class UITableView extends UIScrollView
{
    dataSource = null;    

    allowsMultipleSelection = false;
    indexPathForSelectedRow = null;

    initWithLayer(layer, owner, options?){
        super.initWithLayer(layer, owner, options);

        // Check if we have prototypes
        if (this.layer.childNodes.length > 0) {
            for (let index = 0; index < this.layer.childNodes.length; index++) {
                let subLayer = this.layer.childNodes[index];

                if (subLayer.tagName != "DIV")
                    continue;

                if (subLayer.getAttribute("data-cell-identifier") != null) {
                    this.addCellPrototypeWithLayer(subLayer);                    
                }
                else if (subLayer.getAttribute("data-tableview-header") != null) {
                    this.addHeaderWithLayer(subLayer);
                }
                else if (subLayer.getAttribute("data-tableview-section-header") != null) {
                    this.addSectionHeaderWithLayer(subLayer);
                }
                else if (subLayer.getAttribute("data-tableview-footer") != null) {
                    this.addFooterWithLayer(subLayer);
                }
            }
        } 
        
        if (this.sectionHeaderLayer == null){
            let header = new MUIView();
            header.init();
            header.setHeight(44);            
            MUICoreLayerRemoveStyle(header.layer, "view");
            MUICoreLayerAddStyle(header.layer, "header");
            header.layer.style.position = "relative";            
    
            let titleLabel = new MUILabel();
            titleLabel.init();
            titleLabel.layer.setAttribute("data-header-title", "true");
            MUICoreLayerRemoveStyle(titleLabel.layer, "lbl");
            MUICoreLayerAddStyle(titleLabel.layer, "title");
            header.addSubview(titleLabel);
            
            this.sectionHeaderLayer = header;
        }
    }

    private headerLayer = null;
    private addHeaderWithLayer(layer){    
        layer.style.display = "none";    
        let cellClassname = layer.getAttribute("data-class");
        if (cellClassname == null) cellClassname = "MUIView";
     
        let item = {};
        item["class"] = cellClassname;
        item["layer"] = layer;
        this.headerLayer = item;
    }

    private sectionHeaderLayer = null;
    private addSectionHeaderWithLayer(layer){    
        layer.style.display = "none";    
        let cellClassname = layer.getAttribute("data-class");
        if (cellClassname == null) cellClassname = "MUIView";
     
        let item = {};
        item["class"] = cellClassname;
        item["layer"] = layer;
        this.sectionHeaderLayer = item;
    }

    private cellPrototypes = {};
    private addCellPrototypeWithLayer(layer){
        layer.style.display = "none";
        let cellIdentifier = layer.getAttribute("data-cell-identifier");
        let cellClassname = layer.getAttribute("data-class");
        if (cellClassname == null) cellClassname = "UITableViewCell";

        let item = {};
        item["class"] = cellClassname;
        item["layer"] = layer;

        this.cellPrototypes[cellIdentifier] = item;
    }

    private footerLayer = null;
    private addFooterWithLayer(layer){
        layer.style.display = "none";
        let cellClassname = layer.getAttribute("data-class");
        if (cellClassname == null) cellClassname = "MUIView";
     
        let item = {};
        item["class"] = cellClassname;
        item["layer"] = layer;
        this.footerLayer = item;
    }    

    protected _delegate: UITableViewDelegate|null = null;
    set delegate(value: UITableViewDelegate|null) { this.setDelegate(value); }
    get delegate(): UITableViewDelegate|null { return this._delegate; }

    dequeueReusableCellWithIdentifier(identifier:string): UITableViewCell {
        let item = this.cellPrototypes[identifier];

        //TODO: Make it reusable

        let cell: UITableViewCell = null;        
        let className = item["class"];
        cell = MIOClassFromString(className);        
        //cell.reuseIdentifier = identifier;

        let layer = item["layer"];
        if (layer != null) {
            let newLayer = layer.cloneNode(true);
            newLayer.style.display = "";            
            cell.initWithLayer(newLayer, this);
            cell.awakeFromHTML();
        }

        let tapGesture = new MUITapGestureRecognizer();
        tapGesture.initWithTarget(this, this.cellDidTap);
        cell.addGestureRecognizer(tapGesture);
        cell.addObserver(this, "selected", null);

        cell._target = this;
        //cell._onClickFn = this.cellOnClickFn;
        //cell._onDblClickFn = this.cellOnDblClickFn;
        //cell._onAccessoryClickFn = this.cellOnAccessoryClickFn;
        cell._onEditingAccessoryClickFn = this.cellOnEditingAccessoryClickFn;
        cell._onReorderPointerDownFn = this.cellOnReorderPointerDown;

        return cell;
    }


    rows = [];
    private sections = [];
    private cells = [];

    private addSectionHeader(section){
        let header = null;
        if (typeof this.dataSource.viewForHeaderInSection === "function") header = this.dataSource.viewForHeaderInSection(this, section) as MUIView;                        
        if (header == null && (typeof this.dataSource.titleForHeaderInSection === "function")) {
            let title = this.dataSource.titleForHeaderInSection(this, section);
            if (title == null) return;
            let layer = this.sectionHeaderLayer["layer"].cloneNode(true);
            layer.style.display = "";
            header = new MUIView();
            header.initWithLayer(layer, this);
            header.awakeFromHTML();
            let titleLayer = MUILayerSearchElementByAttribute(layer, "data-header-title");
            titleLayer.innerHTML = title;
        }
        if (header == null) return;
        header.hidden = false;
        this.addSubview(header);
        this.rows.push({"Header": header});
    }

    private addCell(indexPath:MIOIndexPath){
        let cell = this.dataSource.cellAtIndexPath(this, indexPath) as UITableViewCell;
        let section = this.sections[indexPath.section]; 
        if (section == null) {
            this.sections[indexPath.section] = [];
            this.addSectionHeader(indexPath.section);
            section = this.sections[indexPath.section]; 
        }
                
        let nextIP = this.nextIndexPath(indexPath);
        let currentCell = this.cellAtIndexPath(indexPath);
        if (currentCell != null) {
            let index = this.rows.indexOf(currentCell);
            this.insertSubviewAboveSubview(cell, currentCell);
            this.rows.splice(index, 0, cell);
        }
        else if (nextIP != null){
            let nextCell = this.cellAtIndexPath(nextIP);
            let index = this.rows.indexOf(nextCell);
            //Check for header
            let lastRow = this.rows[index - 1];
            if (lastRow != null && (lastRow instanceof MUIView) == false) {
                let header = lastRow["Header"];
                this.insertSubviewAboveSubview(cell, header);
                this.rows.splice(index - 1, 0, cell);
            }
            else {
                this.insertSubviewAboveSubview(cell, nextCell);
                this.rows.splice(index, 0, cell);
            }
        }
        else {
            this.addSubview(cell);
            this.rows.push(cell);
        }

        // Update section
        cell._section = section;        
        if (indexPath.row < section.length - 1) {
            section.splice(indexPath.row, 0, cell);
        }
        else {
            section.addObject(cell);
        }   
        
        if (cell.selected == true) this.indexPathForSelectedRow = indexPath;
        
        if (this.delegate != null && typeof this.delegate.editingStyleForRowAtIndexPath === "function") {
            let editingStyle = this.delegate.editingStyleForRowAtIndexPath(this, indexPath);
            cell.setEditingAccessoryType(editingStyle);
        }

        if (this._editing == true) this._updateReorderControlForCell(cell, indexPath);
    }

    private removeCell(indexPath){        
        let section = this.sections[indexPath.section];
        if (section.length == 0) return;
        let cell = section[indexPath.row];
        
        section.removeObjectAtIndex(indexPath.row);
        this.rows.removeObject(cell);

        cell.removeFromSuperview();
    }

    private nextIndexPath(indexPath:MIOIndexPath){        
        let sectionIndex = indexPath.section;
        let rowIndex = indexPath.row + 1;

        if (sectionIndex >= this.sections.length) return null;
        let section = this.sections[sectionIndex];
        if (rowIndex < section.length) return MIOIndexPath.indexForRowInSection(rowIndex, sectionIndex);

        sectionIndex++;        
        if (sectionIndex >= this.sections.length) return null;
        section = this.sections[sectionIndex];
        if (section != null && section.length > 0) return MIOIndexPath.indexForRowInSection(0, sectionIndex);
        return null;
    }

    private addSectionFooter(section){

    }

    reloadData(){
        if (this.reorderCell != null) this.reorderCleanup(this.reorderCell);

        // Remove all subviews
        for (let index = 0; index < this.rows.length; index++) {
            let row = this.rows[index];
            if (row instanceof MUIView) {
                row.removeFromSuperview();                            
            }
            else {
                let header = row["Header"];
                header.removeFromSuperview();
            }            
        }

        this.rows = [];        
        this.sections = [];
        this.cells = [];
        this.indexPathForSelectedRow = null;
    
        if (this.dataSource == null) return;

        let sections = 1;
        if (typeof this.dataSource.numberOfSections === "function") sections = this.dataSource.numberOfSections(this);
        
        for (let sectionIndex = 0; sectionIndex < sections; sectionIndex++) {            
            let section = [];                                    
            this.sections.push(section);
            
            let rows = this.dataSource.numberOfRowsInSection(this, sectionIndex);            
            if (rows == 0) continue;
            
            this.addSectionHeader(sectionIndex);
            
            for (let cellIndex = 0; cellIndex < rows; cellIndex++) {
                let ip = MIOIndexPath.indexForRowInSection(cellIndex, sectionIndex);
                this.addCell(ip);
            }

            this.addSectionFooter(sectionIndex);                        
        }
    }

    insertRowsAtIndexPaths(indexPaths, rowAnimation){
        for (let index = 0; index < indexPaths.length; index++){
            let ip = indexPaths[index];
            this.addCell(ip);
        }        
    }

    deleteRowsAtIndexPaths(indexPaths, rowAnimation){
        for (let index = 0; index < indexPaths.length; index++){
            let ip = indexPaths[index];
            this.removeCell(ip);
        }
    }

    reloadRowsAtIndexPaths(indexPaths, rowAnimation){
        for (let index = 0; index < indexPaths.length; index++){
            const ip = indexPaths[index];
            // Just to force to the update UI of the cells
            this.dataSource.cellAtIndexPath(this, ip);
        }
    }

    cellAtIndexPath(indexPath:MIOIndexPath){
        if (indexPath.section >= this.sections.length) return null;
        let section = this.sections[indexPath.section];
        if (indexPath.row >= section.length) return null;
        return section[indexPath.row];
    }    

    indexPathForCell(cell: UITableViewCell): MIOIndexPath {
        let section = cell._section;
        if (section == null) return;
        
        let sectionIndex = this.sections.indexOf(section);
        if (section == -1) return null;

        let rowIndex = section.indexOf(cell);
        if (rowIndex == -1) return null;

        return MIOIndexPath.indexForRowInSection(rowIndex, sectionIndex);
    }

    selectRowAtIndexPath(indexPath:MIOIndexPath, animated:boolean){
        let cell = this.cellAtIndexPath(indexPath);
        if (cell != null) cell.selected = true;
    }

    deselectRowAtIndexPath(indexPath:MIOIndexPath, animated:boolean){
        let cell = this.cellAtIndexPath(indexPath);
        if (cell != null) cell.selected = false;
    }

    observeValueForKeyPath(key, type, object) {
        if (type != "did") return;
        if (key != "selected") return;
        
        let cell = object as UITableViewCell;
        let ip = this.indexPathForCell(object);

        if (cell.selected == false && MIOIndexPathEqual(ip, this.indexPathForSelectedRow) == true) this.indexPathForSelectedRow = null;
        else if (cell.selected == true) {
            if (this.indexPathForSelectedRow != null) this.deselectRowAtIndexPath(this.indexPathForSelectedRow, true);
            this.indexPathForSelectedRow = this.indexPathForCell(object);
        }
    }
    
    private cellDidTap(gesture:MUIGestureRecognizer){
        if (gesture.state != MUIGestureRecognizerState.Ended) return;        
        let cell = gesture.view as UITableViewCell;

        if (cell.editingAccessoryDeleteView != null && gesture.lastSystemEvent.sysEvent.target == cell.editingAccessoryDeleteView.layer) return;

        // let section = cell._section;
        // let sectionIndex = this.sections.indexOf(section);
        // let rowIndex = section.indexOfObject(cell);
        
        // if (this.delegate != null && typeof this.delegate.didSelectCellAtIndexPath === "function") {
        //     this.delegate.didSelectCellAtIndexPath(this, MIOIndexPath.indexForRowInSection(rowIndex, sectionIndex));
        // }     
        
        this.cellOnClickFn(cell);
    }

    private cellOnClickFn(cell: UITableViewCell) {

        let indexPath = this.indexPathForCell(cell);

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

    //
    // Editing & row reordering
    //

    private _editing = false;
    get isEditing():boolean { return this._editing; }
    set editing(value:boolean) { this.setEditing(value, false); }

    setEditing(editing:boolean, animated?:boolean){
        if (this._editing == editing) return;
        this._editing = editing;

        for (let sectionIndex = 0; sectionIndex < this.sections.length; sectionIndex++) {
            let section = this.sections[sectionIndex];
            for (let rowIndex = 0; rowIndex < section.length; rowIndex++) {
                let ip = MIOIndexPath.indexForRowInSection(rowIndex, sectionIndex);
                this._updateReorderControlForCell(section[rowIndex], ip);
            }
        }
    }

    private _updateReorderControlForCell(cell:UITableViewCell, indexPath:MIOIndexPath){
        let visible = false;
        if (this._editing == true && this.dataSource != null && typeof this.dataSource.canMoveRowAtIndexPath === "function") {
            visible = this.dataSource.canMoveRowAtIndexPath(this, indexPath);
        }
        if (visible == true && cell._onReorderPointerDownFn == null) {
            // Cells not created through dequeueReusableCellWithIdentifier still get the callback
            cell._target = this;
            cell._onReorderPointerDownFn = this.cellOnReorderPointerDown;
        }
        cell._setReorderControlVisible(visible);
    }

    // Programmatic move. Like UIKit, it only updates the UI: the caller is responsible
    // for keeping its model in sync. The interactive reorder calls the data source instead.
    moveRowAtIndexPathToIndexPath(indexPath:MIOIndexPath, newIndexPath:MIOIndexPath){
        let cell = this.cellAtIndexPath(indexPath);
        if (cell == null) return;

        let toSection = this.sections[newIndexPath.section];
        if (toSection == null) return;

        let maxRow = toSection.length;
        if (newIndexPath.section == indexPath.section) maxRow--;
        let row = newIndexPath.row;
        if (row > maxRow) row = maxRow;
        if (row < 0) row = 0;

        this._moveCell(cell, indexPath, MIOIndexPath.indexForRowInSection(row, newIndexPath.section));
    }

    private _moveCell(cell:UITableViewCell, from:MIOIndexPath, to:MIOIndexPath){
        let fromSection = this.sections[from.section];
        fromSection.removeObjectAtIndex(from.row);
        this.rows.removeObject(cell);

        let toSection = this.sections[to.section];
        if (to.row < toSection.length) {
            let refCell = toSection[to.row];
            this.layer.insertBefore(cell.layer, refCell.layer);
            this.rows.splice(this.rows.indexOf(refCell), 0, cell);
        }
        else if (toSection.length > 0) {
            let lastCell = toSection[toSection.length - 1];
            this.layer.insertBefore(cell.layer, lastCell.layer.nextSibling);
            this.rows.splice(this.rows.indexOf(lastCell) + 1, 0, cell);
        }
        else {
            this.layer.appendChild(cell.layer);
            this.rows.push(cell);
        }
        toSection.splice(to.row, 0, cell);
        cell._section = toSection;

        this._updateIndexPathForSelectedRow();
    }

    private _updateIndexPathForSelectedRow(){
        if (this.indexPathForSelectedRow == null) return;
        for (let sectionIndex = 0; sectionIndex < this.sections.length; sectionIndex++) {
            let section = this.sections[sectionIndex];
            for (let rowIndex = 0; rowIndex < section.length; rowIndex++) {
                if (section[rowIndex].selected == true) {
                    this.indexPathForSelectedRow = MIOIndexPath.indexForRowInSection(rowIndex, sectionIndex);
                    return;
                }
            }
        }
    }

    private reorderCell:UITableViewCell = null;
    private reorderFromIndexPath:MIOIndexPath = null;
    private reorderPointerId = null;
    private reorderGhostLayer = null;
    private reorderGrabOffsetY = 0;
    private reorderLastClientY = 0;
    private reorderScrollDirection = 0;
    private reorderScrollTimer = null;
    private reorderMoveFn = null;
    private reorderUpFn = null;

    private cellOnReorderPointerDown(cell:UITableViewCell, ev:PointerEvent){
        if (this.reorderCell != null) return;

        let indexPath = this.indexPathForCell(cell);
        if (indexPath == null) return;
        if (this.dataSource == null || typeof this.dataSource.canMoveRowAtIndexPath !== "function") return;
        if (this.dataSource.canMoveRowAtIndexPath(this, indexPath) == false) return;

        // Canceling the pointerdown also suppresses the compatibility mouse events,
        // so the cell's tap gesture never fires for this interaction.
        ev.preventDefault();
        ev.stopPropagation();

        this.reorderCell = cell;
        this.reorderFromIndexPath = indexPath;
        this.reorderLastClientY = ev.clientY;

        let rect = cell.layer.getBoundingClientRect();
        this.reorderGrabOffsetY = ev.clientY - rect.top;

        let ghost = cell.layer.cloneNode(true);
        ghost.style.position = "fixed";
        ghost.style.boxSizing = "border-box";
        ghost.style.left = rect.left + "px";
        ghost.style.top = rect.top + "px";
        ghost.style.width = rect.width + "px";
        ghost.style.height = rect.height + "px";
        ghost.style.margin = "0";
        ghost.style.zIndex = "10000";
        ghost.style.opacity = "0.9";
        ghost.style.pointerEvents = "none";
        ghost.style.boxShadow = "0 4px 14px rgba(0,0,0,0.25)";
        // The ghost must live inside the table, not on document.body: cell
        // styling is usually scoped to the page (e.g. #page-id .cell), so a
        // body-level clone loses all of it and renders unstyled. position:fixed
        // keeps it viewport-anchored regardless of the parent.
        this.layer.appendChild(ghost);
        this.reorderGhostLayer = ghost;

        MUICoreLayerAddStyle(cell.layer, "reorder-placeholder");
        cell.layer.style.opacity = "0.35";

        // Capture on the table layer, NOT the handle: the handle moves in the DOM
        // on every live reorder (insertBefore), and reparenting a captured element
        // makes the browser drop the pointer capture mid-drag.
        this.reorderPointerId = ev.pointerId;
        if (typeof this.layer.setPointerCapture === "function") {
            try { this.layer.setPointerCapture(ev.pointerId); } catch (e) { }
        }

        // Window-level listeners so the drag survives regardless of capture support
        this.reorderMoveFn = this.reorderPointerMove.bind(this);
        this.reorderUpFn = this.reorderPointerUp.bind(this);
        window.addEventListener("pointermove", this.reorderMoveFn, true);
        window.addEventListener("pointerup", this.reorderUpFn, true);
        window.addEventListener("pointercancel", this.reorderUpFn, true);

        let instance = this;
        this.reorderScrollTimer = window.setInterval(function(){
            if (instance.reorderCell == null) return;
            if (instance.reorderScrollDirection == 0) return;
            instance.layer.scrollTop += instance.reorderScrollDirection * 8;
            instance.reorderUpdateTarget();
        }, 16);
    }

    private reorderPointerMove(ev:PointerEvent){
        if (this.reorderCell == null) return;
        if (ev.pointerId != this.reorderPointerId) return;
        ev.preventDefault();

        this.reorderLastClientY = ev.clientY;
        this.reorderGhostLayer.style.top = (ev.clientY - this.reorderGrabOffsetY) + "px";

        let rect = this.layer.getBoundingClientRect();
        let zone = 40;
        if (ev.clientY < rect.top + zone) this.reorderScrollDirection = -1;
        else if (ev.clientY > rect.bottom - zone) this.reorderScrollDirection = 1;
        else this.reorderScrollDirection = 0;

        this.reorderUpdateTarget();
    }

    private reorderUpdateTarget(){
        let cell = this.reorderCell;
        if (cell == null) return;

        let current = this.indexPathForCell(cell);
        if (current == null) return;

        let proposed = this.reorderProposedIndexPath(this.reorderLastClientY, current);
        if (proposed == null) return;

        if (this.delegate != null && typeof this.delegate.targetIndexPathForMoveFromRowAtIndexPath === "function") {
            proposed = this.delegate.targetIndexPathForMoveFromRowAtIndexPath(this, this.reorderFromIndexPath, proposed);
            if (proposed == null) return;
        }

        if (MIOIndexPathEqual(proposed, current) == true) return;
        this._moveCell(cell, current, proposed);
    }

    // Returns the index path where the dragged cell would land, expressed in
    // coordinates that assume the cell was removed from its current position first.
    private reorderProposedIndexPath(clientY:number, current:MIOIndexPath):MIOIndexPath {
        let dragCell = this.reorderCell;

        for (let sectionIndex = 0; sectionIndex < this.sections.length; sectionIndex++) {
            let section = this.sections[sectionIndex];
            let adjustedRow = 0;
            for (let rowIndex = 0; rowIndex < section.length; rowIndex++) {
                let c = section[rowIndex];
                if (c == dragCell) continue;
                let rect = c.layer.getBoundingClientRect();
                if (clientY < rect.top + rect.height / 2) {
                    return MIOIndexPath.indexForRowInSection(adjustedRow, sectionIndex);
                }
                adjustedRow++;
            }
        }

        // Below every row: append at the end of the last section that has rows
        for (let sectionIndex = this.sections.length - 1; sectionIndex >= 0; sectionIndex--) {
            let section = this.sections[sectionIndex];
            let count = 0;
            for (let rowIndex = 0; rowIndex < section.length; rowIndex++) {
                if (section[rowIndex] != dragCell) count++;
            }
            if (count > 0 || sectionIndex == current.section) {
                return MIOIndexPath.indexForRowInSection(count, sectionIndex);
            }
        }

        return null;
    }

    private reorderPointerUp(ev:PointerEvent){
        let cell = this.reorderCell;
        if (cell == null) return;
        if (ev.pointerId != this.reorderPointerId) return;

        let from = this.reorderFromIndexPath;
        this.reorderCleanup(cell);

        let to = this.indexPathForCell(cell);
        if (from == null || to == null) return;

        if (ev.type == "pointercancel") {
            if (MIOIndexPathEqual(from, to) == false) this._moveCell(cell, to, from);
            return;
        }

        if (MIOIndexPathEqual(from, to) == true) return;

        if (this.dataSource != null && typeof this.dataSource.moveRowAtIndexPath === "function") {
            this.dataSource.moveRowAtIndexPath(this, from, to);
        }
    }

    private reorderCleanup(cell:UITableViewCell){
        window.removeEventListener("pointermove", this.reorderMoveFn, true);
        window.removeEventListener("pointerup", this.reorderUpFn, true);
        window.removeEventListener("pointercancel", this.reorderUpFn, true);

        if (this.reorderPointerId != null && typeof this.layer.releasePointerCapture === "function") {
            try { this.layer.releasePointerCapture(this.reorderPointerId); } catch (e) { }
        }

        if (this.reorderScrollTimer != null) {
            window.clearInterval(this.reorderScrollTimer);
            this.reorderScrollTimer = null;
        }

        if (this.reorderGhostLayer != null && this.reorderGhostLayer.parentNode != null) {
            this.reorderGhostLayer.parentNode.removeChild(this.reorderGhostLayer);
        }
        this.reorderGhostLayer = null;

        cell.layer.style.opacity = "";
        MUICoreLayerRemoveStyle(cell.layer, "reorder-placeholder");

        this.reorderCell = null;
        this.reorderFromIndexPath = null;
        this.reorderPointerId = null;
        this.reorderScrollDirection = 0;
        this.reorderMoveFn = null;
        this.reorderUpFn = null;
    }

    private cellOnEditingAccessoryClickFn(cell:UITableViewCell) {
        let indexPath = this.indexPathForCell(cell);

        if (this.delegate != null && typeof this.delegate.editingStyleForRowAtIndexPath === "function") {
            let editingStyle = this.delegate.editingStyleForRowAtIndexPath(this, indexPath);
        
            if (this.delegate != null && typeof this.delegate.commitEditingStyleForRowAtIndexPath === "function") {
                this.delegate.commitEditingStyleForRowAtIndexPath(this, editingStyle, indexPath);
            }
        }
    }

}


class UITableViewSection extends MUIView 
{
    static section(){

    }
}

class UITableViewRow extends MUIView 
{
    static rowWithSectionAndCell(section, cell){
        let row = new UITableViewRow();
        row.init();
        row.section = section;
        row.cell = cell;
    }

    section = null;
    cell = null;
}