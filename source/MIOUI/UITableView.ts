import { MUIView , UITableViewCell, MUIGestureRecognizer, MUITapGestureRecognizer, MUIGestureRecognizerState} from ".";
import { MIOUUID, MIOIndexPath, MIOIndexPathEqual } from "../MIOFoundation";
import { MIOClassFromString } from "../MIOCore/platform";
import { MUILayerGetFirstElementWithTag, MUILayerSearchElementByAttribute } from "./MUIView";
import { MUICoreLayerRemoveStyle, MUICoreLayerAddStyle } from "./MIOUI_CoreLayer";
import { MUILabel } from "./MUILabel";
import { UIScrollView } from "./UIScrollView";
import { UIEdgeInsets } from "./UIEdgeInsets";


export class UITableView extends UIScrollView
{
    dataSource = null;
    delegate = null;

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

        return cell;
    }


    private rows = [];    
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