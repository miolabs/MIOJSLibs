import { MUIView, MUILayerGetFirstElementWithTag } from "./MUIView"
import { MUIScrollView } from "./MUIScrollView";
import { MUILabel } from "./MUILabel";
import { MUICoreLayerCreateWithStyle } from "./MIOUI_CoreLayer";
import { MIODateGetStringForDay, MIODateGetStringForMonth, MIODateGetDayFromDate, MIORect, MIOSize, MIOCoreGetBrowser, MIOCoreBrowserType, MIOClassFromString } from "../index.webapp";
import { MIODateCopy } from "../MIOFoundation";

/**
 * Created by godshadow on 11/3/16.
 */

export class MUICalendarHeader extends MUIView 
{
    init(){
        super.init();

        this.layer.style.width = "100%";
        this.layer.style.borderBottom = "1px solid rgb(208, 208, 219)";
        this.setHeight(23);

        var w = 100 / 7;
        for (let index = 0; index < 7; index++){

            let dayLabel = new MUILabel();
            dayLabel.initWithLayer(MUICoreLayerCreateWithStyle("calendarview_month_header_day_title"), this);
            dayLabel.layer.style.top = "0px";
            dayLabel.layer.style.height = "21px";
            dayLabel.layer.style.left = (w * index) + "%";
            dayLabel.layer.style.width = w + "%";
            dayLabel.text = MIODateGetStringForDay(index).substr(0, 2);
            this.addSubview(dayLabel);
        }
    }

    initWithLayer(layer, owner, options?){
        super.initWithLayer(layer, owner, options);

        //TODO        
    }
}

export enum MUICalendarDayCellType
{
    Default,
    Custom
}

export class MUICalendarDayCell extends MUIView {
    
    type = MUICalendarDayCellType.Default;
    identifier = null;
    weekRow: number;

    dayLabel:MUILabel = null;

    private _date: Date = null;
    get date(): Date {
        return this._date;
    }

    private _day = null;
    private _month = null;
    private _year = null;    

    private _selected = false;
    set selected(value:boolean) {this.setSelected(value);}
    get selected() {return this._selected;}

    private _isToday = false;

    init() {
        super.init();

        this.type = MUICalendarDayCellType.Default;
        this.layer.style.background = "";

        this._setupLayer();
    }

    initWithLayer(layer, owner, options?)
    {
        super.initWithLayer(layer, owner, options);
        this.type = MUICalendarDayCellType.Custom;

        if (this.layer.childNodes.length > 0) {
            for (var index = 0; index < this.layer.childNodes.length; index++) {
                var subLayer = this.layer.childNodes[index];

                if (subLayer.tagName != "DIV")
                    continue;

                if (subLayer.getAttribute("data-day-label") != null) {
                    this.dayLabel = new MUILabel();
                    this.dayLabel.initWithLayer(subLayer, this);
                }
            }
        }

        this._setupLayer();
    }

    private _setupLayer()
    {
        this.layer.style.position = "absolute";

        if (this.dayLabel == null){

            this.dayLabel = new MUILabel();
            this.dayLabel.init();
            this.addSubview(this.dayLabel);
    
            this.dayLabel.layer.style.background = "";
            this.dayLabel.layer.style.left = "";
            this.dayLabel.layer.style.top = "";
            this.dayLabel.layer.style.width = "";
            this.dayLabel.layer.style.height= "";                            
        }

        var instance = this;
        this.layer.onclick = function () {
                instance._onClick.call(instance);
        }        
    }

    private _onClick() {
        this.setSelected(true);
    }

    setDate(date: Date) {
        this._date = new Date(date.getTime());

        this._day = date.getDate();
        this._month = date.getMonth();
        this._year = date.getFullYear();

        var today = new Date();
        var d = today.getDate();
        var m = today.getMonth();
        var y = today.getFullYear();

        if (this.type == MUICalendarDayCellType.Default)
            this.dayLabel.text = date.getDate();
        else if (this.dayLabel != null) 
            this.dayLabel.text = date.getDate();        

        var isToday = (this._day == d && this._month == m && this._year == y);
        this.setToday(isToday);
    }

    setToday(value:boolean)
    {
        //if (this.type == MUICalendarDayCellType.Custom) return;

        if (value == true)
        {
            this.layer.classList.add("today");                     
            //this._titleLabel.layer.classList.remove("calendarview_day_title");
            //this.layer.classList.add("calendarview_today_day_cell");
            //this._titleLabel.layer.classList.add("calendarview_today_day_title");
        }
        else 
        {
            this.layer.classList.remove("today");
            //this.layer.classList.add("calendarview_day_cell");
            //this._titleLabel.layer.classList.add("calendarview_day_title");
            //this.layer.classList.remove("calendarview_today_day_cell");
            //this._titleLabel.layer.classList.remove("calendarview_today_day_title");            
        }        

    }

    setSelected(value:boolean){

        if (this._selected == value) return;                        

        this.willChangeValue("selected");
        this._selected = value;
        if (value == true)
            this.layer.classList.add("selected");        
        else 
            this.layer.classList.remove("selected");        
        this.didChangeValue("selected");
    }
}

export class MUICalendarMonthView extends MUIView {
    private _month = null;
    get month() {
        return this._month;
    }

    private _year = null;
    get year() {
        return this._year;
    }

    firstDate = null;
    lastDate = null;

    cellSpacingX = 0;
    cellSpacingY = 0;

    private _header = null;
    private _headerTitleLabel = null;

    private _dayViews = [];
    private _dayViewIndex = 0;

    private _weekRows = 0;
    private _delegate = null;

    initWithMonth(month, year, delegate) {
        
        super.init();

        this._delegate = delegate;

        this.layer.style.position = "relative";
        this.layer.style.background = "";

        this._header = new MUIView();
        this._header.initWithLayer(MUICoreLayerCreateWithStyle("calendarview_month_header"), this);
        //this._header.layer.style.position = "sticky";
        this.addSubview(this._header);

        this._headerTitleLabel = new MUILabel();
        this._headerTitleLabel.initWithLayer(MUICoreLayerCreateWithStyle("calendarview_month_header_title"), this);
        this._header.addSubview(this._headerTitleLabel);

        this.setMonth(month, year);
    }

    setMonth(month, year) {
        if (month < 0) {

            this._month = 11;
            this._year = year - 1;
        }
        else if (month > 11) {

            this._month = 0;
            this._year = year + 1;
        }
        else {

            this._month = month;
            this._year = year;
        }

        for(var count = 0; count < this._dayViews.length; count++)
        {
            var dayCell = this._dayViews[count];
            var identifier = dayCell.identifier

            this._delegate._reuseDayCell(dayCell, identifier);
            dayCell.removeFromSuperview();
        }
    
        this._dayViews = [];
        this._dayViewIndex = 0;

        this._setupHeader();
        this._setupDays();
    }

    private _setupHeader() {
        this._headerTitleLabel.text = MIODateGetStringForMonth(this._month) + " " + this._year;
    }

    private _dayCellAtDate(date) {
        let dv = this._delegate._cellDayAtDate(MIODateCopy(date));
        this._dayViewIndex++;

        return dv;
    }

    private _setupDays() {
        
        this.firstDate = new Date(this._year, this._month, 1); 
        this.lastDate = new Date(this._year, this._month + 1, 0);
        var currentDate = new Date(this._year, this._month, 1);

        var rowIndex = MIODateGetDayFromDate(currentDate) == 0 ? -1 : 0;

        while (this.lastDate >= currentDate) {
            var dayView = this._dayCellAtDate(currentDate);
            this._dayViews.push(dayView);
            this.addSubview(dayView);
            dayView.setDate(currentDate);

            // Calculate rows
            if (MIODateGetDayFromDate(dayView.date) == 0)
                rowIndex++;

            dayView.weekRow = rowIndex;

            currentDate.setDate(currentDate.getDate() + 1);
        }

        this._weekRows = rowIndex + 1;
    }

    layoutSubviews() {
        // Layout header
        this._header.setY(2);
        this._header.setWidth(this.getWidth() - 21);
        let headerHeight = this._header.getHeight() + 1;

        // Layout days
        // var w = 100 / 7;
        // dayLabel.layer.style.left = (w * index) + "%";
        // dayLabel.layer.style.width = w + "%";

        let x = 0;
        let y = 0;
        let w = (this.getWidth() - 22) / 7;
        let h = w;

        // Offset x mapping index by day
        let offsetX = [0, w, w * 2, w * 3, w * 4, w * 5, w * 6];


        for (let index = 0; index < this._dayViews.length; index++) {
            let dv = this._dayViews[index];

            x = offsetX[MIODateGetDayFromDate(dv.date)];
            y = headerHeight + (dv.weekRow * h);

            dv.setFrame(MIORect.rectWithValues(x, y, w, h));
            dv.layoutSubviews();
        }

        this.setHeight(headerHeight + (this._weekRows * h));
    }
}

export class MUICalendarView extends MUIView {
    
    dataSource = null;
    delegate = null;

    minDate:Date = null;
    maxDate:Date = null;

    horizontalCellSpacing = 0;
    verticalCellSpacing = 0;

    selectedDate = null;
    private _selectedDayCell = null;

    private _today = new Date();
    public get today() { return this._today;}

    private _currentMonth = this._today.getMonth();

    private _cellPrototypes = {};
    private _reusablePrototypeDayCells = {};
    private _reusableDayCells = [];

    private _views = [];
    private _visibleDayCells = {};

    private scrollTopLimit = 0;
    private scrollBottomLimit = 0;

    private contentView:MUIScrollView = null;

    init(){
        super.init();
        this._setup();
    }

    initWithLayer(layer, owner, options?) {

        super.initWithLayer(layer, owner, options);
        this._setup();

        // Check if we have prototypes
        if (this.layer.childNodes.length > 0) {
            for (var index = 0; index < this.layer.childNodes.length; index++) {
                var subLayer = this.layer.childNodes[index];

                if (subLayer.tagName != "DIV")
                    continue;

                if (subLayer.getAttribute("data-header") != null){
                    this.addHeaderWithLayer(subLayer);
                    subLayer.style.display = "none";
                }
                else if (subLayer.getAttribute("data-month-header") != null){
                    this.addMonthHeaderWithLayer(subLayer);
                    subLayer.style.display = "none";
                }
                else if (subLayer.getAttribute("data-cell-identifier") != null) {
                    this._addCellPrototypeWithLayer(subLayer);
                    subLayer.style.display = "none";
                }
            }
        }
    }

    private header:MUICalendarHeader = null;
    private _setup(){

        if (this.header == null) {
            this.header = new MUICalendarHeader();
            this.header.init();
            this.addSubview(this.header);
        }

        this.contentView = new MUIScrollView();
        this.contentView.init();      
        this.contentView.layer.style.top = "23px";
        this.contentView.layer.style.width = "100%";
        this.contentView.layer.style.height = "";        
        this.contentView.layer.style.bottom = "0px";
        this.contentView.layer.style.background = "#EDEDF2";
        this.contentView.showsVerticalScrollIndicator = false;
        this.contentView.delegate = this;

        this.addSubview(this.contentView);             
    }

    private addHeaderWithLayer(layer){
        this.header = new MUICalendarHeader();
        this.header.initWithLayer(layer, this);
    }

    private addMonthHeaderWithLayer(layer){

    }

    private _addCellPrototypeWithLayer(subLayer) {
        var cellIdentifier = subLayer.getAttribute("data-cell-identifier");
        var cellClassname = subLayer.getAttribute("data-class");
        if (cellClassname == null) cellClassname = "MUICalendarDayCell";

        var item = {};
        item["class"] = cellClassname;
        item["layer"] = subLayer;

        this._cellPrototypes[cellIdentifier] = item;
    }

    _reuseDayCell(cell, identifier?:string){
        if (identifier == null)
            this._reusableDayCells.push(cell);
        else 
        {
            var array = this._reusablePrototypeDayCells[identifier];
            if (array == null){
                array = [];
                this._reusablePrototypeDayCells[identifier] = array;
            }

            array.push(cell);

            delete this._visibleDayCells[cell.date];
        }
    }

    private _cellDayAtDate(date){
        var dayCell = null;
        if (this.dataSource != null && typeof this.dataSource.dayCellAtDate === "function")
            dayCell = this.dataSource.dayCellAtDate(this, date);
        
        if (dayCell == null){
            // Standard
            dayCell = this.dequeueReusableDayCellWithIdentifier();
        }

        this._visibleDayCells[date] = dayCell;

        return dayCell;
    }
/*
    registerClassForIndentifier(classname:string, identifier:string){

        var item = {};
        item["class"] = classname;

        this._cellPrototypes[identifier] = item;
    }*/

    cellDayAtDate(date){
        return this._visibleDayCells[date];
    }

    dequeueReusableDayCellWithIdentifier(identifier?:string){
        var dv = null;

        if (identifier != null){
            var cells = this._reusablePrototypeDayCells[identifier];
            if (cells != null && cells.length > 0)
            {
                dv = cells[0];
                cells.splice(0, 1);
            }
            else
            {
                //instance creation here
                var item = this._cellPrototypes[identifier];
                if (item == null) throw new Error("Calendar day identifier doesn't exist.");
                
                var className = item["class"];
                dv = MIOClassFromString(className);

                var layer = item["layer"];
                if (layer != null) {
                    var newLayer = layer.cloneNode(true);                
                    newLayer.style.display = "";
                    dv.initWithLayer(newLayer);
                    dv.awakeFromHTML();
                }
                // Register for selection
                dv.addObserver(this, "selected");            
            }
        }
        else 
        {
            if (this._reusableDayCells.length > 0){
                dv = this._reusableDayCells[0];
                this._reusableDayCells.splice(0, 1);
            }
            else {
                dv = new MUICalendarDayCell();
                dv.init();
                
                // Register for selection
                dv.addObserver(this, "selected");                        
            }                        
        }

        return dv;
    }

    reloadData() {        
        /*
        // Remove all subviews
        for (let index = 0; index < this._views.length; index++) {
            var view = this._views[index];
            view.removeFromSuperview();
        }

        this._views = [];

        var currentYear = this.today.getFullYear();
        let currentMonth = this.today.getMonth() - 1;
                        
        if (this.minDate != null) {
            
            var firstDay = new Date(currentYear, currentMonth + 1, 1);
            if (firstDay <= this.minDate)
                currentMonth += 1;
        }

        for (let index = 0; index < 24; index++) {
            var mv = new MUICalendarMonthView();
            mv.initWithMonth(currentMonth, currentYear, this);
            mv.cellSpacingX = this.horizontalCellSpacing;
            mv.cellSpacingY = this.verticalCellSpacing;
            this.addSubview(mv);
            this._views.push(mv);

            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
        }
        
        this.initialReload = true;
        this.setNeedsDisplay();*/
    }

    private initialReload = false;

    
    layoutSubviews() {
        //super.layout();

        if (this._viewIsVisible == false) return;
        if (this.hidden == true) return;        
      
        if (this.initialReload == false) {
            this.initialReload = true;
            this.initialLayout();
        }
        // else {
        //     this.scrollLayout();
        // }
    }        

    private initialLayout(){
        
        //let w = 100 / 7;
        //let h = this.getHeight();

        let x = 0;
        let y = 0;

        var currentYear = this.today.getFullYear();
        let currentMonth = this.today.getMonth() - 1;

        if (this.minDate != null) {            
            var firstDay = new Date(currentYear, currentMonth + 1, 1);
            if (firstDay <= this.minDate)
                currentMonth += 1;
        }

        for (let index = 0; index < 3; index++) {
            let mv:MUICalendarMonthView = new MUICalendarMonthView();
            mv.initWithMonth(currentMonth, currentYear, this);
            this.contentView.addSubview(mv);
            this._views.push(mv);
            
            // var mv = this._views[index];
            // mv.setFrame(MIORect.rectWithValues(x, y, w, h));
            // mv.layer.style.top = "";
            mv.layoutSubviews();

            y += mv.getHeight();

            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }            
        }

        this.contentView.contentSize = new MIOSize(0, y);

        let h = this.getHeight();
        let middle = h / 2;
        this.scrollTopLimit = middle;
        this.scrollBottomLimit = y -  middle;  

        this.scrollToDate(this.today);
    }

    scrollViewDidScroll(scrollView:MUIScrollView){
        this.scrollLayout();
    }

    private scrollLayout() {
        
        let scrollDown = false;
        
        if (this.contentView.contentOffset.y + this.getWidth() > this.scrollBottomLimit) {
            scrollDown = true;
        }
        else if (this.contentView.contentOffset.y < this.scrollTopLimit) {
            scrollDown = false;
        }
        else {
            return;
        }
        
        if (scrollDown == false) {
                        
            // Going up
            let firstMonth = this._views[0];
            let currentMonth = this._views[1];
            let lastMonth = this._views[2];

            if (this.minDate != null && firstMonth.firstDate <= this.minDate) return;

            lastMonth.setMonth(firstMonth.month - 1, firstMonth.year);

            this._views[0] = lastMonth;
            this._views[1] = firstMonth;
            this._views[2] = currentMonth;

            // Calculate the height before the changes            
            lastMonth.removeFromSuperview();
            this.contentView.addSubview(lastMonth, 0);            

            lastMonth.layoutSubviews();            

            this.contentView.contentSize = new MIOSize(0, firstMonth.getHeight() + currentMonth.getHeight() + lastMonth.getHeight());
        }
        else {
            // Going down

            let firstMonth = this._views[0];
            let currentMonth = this._views[1];
            let lastMonth = this._views[2];

            if (this.maxDate != null && lastMonth.lastDate > this.maxDate) return;

            firstMonth.setMonth(lastMonth.month + 1, lastMonth.year);

            this._views[0] = currentMonth;
            this._views[1] = lastMonth;
            this._views[2] = firstMonth;
                                    
            firstMonth.removeFromSuperview();
            this.contentView.addSubview(firstMonth);
            
            firstMonth.layoutSubviews();

            this.contentView.contentSize = new MIOSize(0, firstMonth.getHeight() + currentMonth.getHeight() + lastMonth.getHeight());
        }

    }

    observeValueForKeyPath(key, type, object) {
        if (key == "selected" && type == "did") {
            this._didChangeDayCellSelectedValue(object);
        }
    }

    private _didChangeDayCellSelectedValue(dayCell:MUICalendarDayCell) {

        if (dayCell.selected == true) {

            var canSelect = true;
            if (this.delegate != null && typeof this.delegate.canSelectDate === "function"){            
                canSelect = this.delegate.canSelectDate.call(this.delegate, this, dayCell.date);
            }

            if (canSelect == false) return; 

            if(this._selectedDayCell != null) {                
                this._selectedDayCell.setSelected(false);
                if (this.delegate != null && typeof this.delegate.didDeselectDayCellAtDate === "function")
                this.delegate.didDeselectDayCellAtDate.call(this.delegate, this, this._selectedDayCell.date);
            }

            this.selectedDate = dayCell.date;
            this._selectedDayCell = dayCell;            

            if (this.delegate != null && typeof this.delegate.didSelectDayCellAtDate === "function"){                                
                this.delegate.didSelectDayCellAtDate.call(this.delegate, this, dayCell.date);
            }    
        }
    }

    scrollToDate(date: Date) {
        
        let firstMonthView:MUICalendarMonthView = this._views[0];

        let firstMonth = firstMonthView.month;
        var firstYear = firstMonthView.year;
        
        let currentMonth = date.getMonth();
        var currentYear = date.getFullYear();

        var h = this.getHeight();
        var count = 0;

        var yy = currentYear - firstYear;
        if (yy <= 0){
            count = currentMonth - firstMonth;            
        }
        else {
            count = 11 - firstMonth; // Counting 'til the end of the year
            count += ((yy - 1) * 12); // add months per year change
            count += currentMonth + 1; // Add the month of actual year
        }

        if (count != 0) {
            var y = h * count;
            this.contentView.scrollToPoint(0, y);            
        }         
    }

    deselectCellAtDate(date:Date){

        /*if (this.selectedDate == date)
            this._selectedDayCell.setSelected(false);*/
    }

}

export function MIOCalendarGetStringFromDate(date) {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = date.getDate().toString();

    var d = yyyy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0]); // padding

    return d;
}
