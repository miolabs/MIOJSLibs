import { MUIView, MUICollectionView, MUIButton, MUICoreLayerAddStyle, MUICoreLayerRemoveStyle, MUILabel, MUIGestureRecognizer, MUIGestureRecognizerState, MUITapGestureRecognizer, MUIComboBox } from ".";
import { MIODateCopy, MIODateGetDayFromDate, MIORect, MIODateGetMonthFromDate, MIODateToday, MIODateGetYearFromDate, MIODateGetDateString, MIODateGetStringForMonth, MIODateGetDayStringFromDate } from "../MIOFoundation";
import { MIOClassFromString } from "../MIOCore/platform/WebWorker/MIOCore_WebWorker";

export class MUICalendarHeader extends MUIView
{
    delegate = null;

    private navBar:MUIView = null;

    private prevButton:MUIButton = null;
    private nextButton:MUIButton = null;
    private monthComboBox:MUIComboBox = null;
    private yearComboBox:MUIComboBox = null;    

    init(){
        throw new Error("MIOCalendar: Can't initizalize heder without delegate.");
    }

    initWithDelegate(delegate){
        super.init();      
        this.delegate = delegate;
        MUICoreLayerAddStyle(this.layer, "calendar-header");
        this.setup();
    }

    initWithLayer(layer, owner, options){
        super.initWithLayer(layer, owner, options);
    }

    private setup(){
        this.navBar = new MUIView();
        this.navBar.init();
        MUICoreLayerAddStyle(this.navBar.layer, "view");   
        MUICoreLayerAddStyle(this.navBar.layer, "calendar-nav"); 
        this.addSubview(this.navBar);

        if (this.prevButton == null){
            this.prevButton = new MUIButton();
            this.prevButton.init();
            MUICoreLayerAddStyle(this.prevButton.layer, "back");   
            MUICoreLayerAddStyle(this.prevButton.layer, "calendar-prev-btn"); 
            this.navBar.addSubview(this.prevButton); 
        }
        this.prevButton.setAction(this, function(){
            this.addDateOffset(-1);
        });

        if (this.monthComboBox == null) {
            this.monthComboBox = new MUIComboBox();
            this.monthComboBox.init();
            MUICoreLayerAddStyle(this.monthComboBox.layer, "input-combobox");
            this.navBar.addSubview(this.monthComboBox); 
        }

        // Add months
        this.monthComboBox.removeAllItems();        
        for (let index = 0; index < 12; index++) {
            this.monthComboBox.addItem(MIODateGetStringForMonth(index), index);
        }
        this.monthComboBox.setOnChangeAction(this, function(control, value){
            let m = parseInt(value);
            let y = parseInt(this.yearComboBox.getSelectedItem());
            this.delegate.monthAndDateDidChange(m, y);
        });

        if (this.yearComboBox == null) {
            this.yearComboBox = new MUIComboBox();
            this.yearComboBox.init();            
            MUICoreLayerAddStyle(this.yearComboBox.layer, "input-combobox");            
            this.navBar.addSubview(this.yearComboBox); 
        }

        // Add years
        this.yearComboBox.removeAllItems();        
        // Get 10 years, 5 years before, 5 year after the selected year
        let year = MIODateGetYearFromDate(MIODateToday());
        let minYear = year - 5;
        let maxYear = year + 5;
        for (let index = minYear; index < maxYear; index++) {
            this.yearComboBox.addItem(index);
        }

        this.yearComboBox.setOnChangeAction(this, function(control, value){
            let m = parseInt(this.monthComboBox.getSelectedItem());
            let y = parseInt(value);            
            this.delegate.monthAndDateDidChange(m, y);
        });

        if (this.nextButton == null){
            this.nextButton = new MUIButton();
            this.nextButton.init();
            MUICoreLayerAddStyle(this.nextButton.layer, "next");   
            MUICoreLayerAddStyle(this.nextButton.layer, "calendar-next-btn"); 
            this.navBar.addSubview(this.nextButton); 
        }
        this.nextButton.setAction(this, function(){
            this.addDateOffset(1);
        });

        let calendarDaysBar = new MUIView();
        calendarDaysBar.init();
        MUICoreLayerRemoveStyle(calendarDaysBar.layer, "view");
        MUICoreLayerAddStyle(calendarDaysBar.layer, "calendar-day-bar");   
        this.addSubview(calendarDaysBar);

        let days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
        for (let index = 0; index < 7; index++){
            let dh = new MUILabel();
            dh.init();
            dh.text = days[index];
            MUICoreLayerRemoveStyle(dh.layer, "view");
            MUICoreLayerAddStyle(dh.layer, "day-title");
            calendarDaysBar.addSubview(dh);
        }
    }

    setMonth(month){
        this.monthComboBox.selectItem(month);       
    }

    setYear(year){
        this.yearComboBox.selectItem(year);
    }

    setNavBarHidden(value:boolean){
        this.navBar.setHidden(value);
    }

    addDateOffset(offset){
        let m =  parseInt(this.monthComboBox.getSelectedItem());
        let y = parseInt(this.yearComboBox.getSelectedItem());

        m += offset;
        if (m < 0) {
            m = 11;
            y--;
        }
        else if (m > 11) {
            m = 0;
            y++;
        }
        this.monthComboBox.selectItem(m);
        this.yearComboBox.selectItem(y);
        this.delegate.monthAndDateDidChange(m, y);
    }
}

export class MUICalendarDaysView extends MUIView {
    
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
    private delegate = null;

    initWithDelegate(delegate) {        
        super.init();
        this.delegate = delegate;
        MUICoreLayerAddStyle(this.layer, "calendar-days-view");        
    }

    setMonthAndYear(month, year) {
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

        for(var count = 0; count < this._dayViews.length; count++){
            let dayCell = this._dayViews[count];
            let identifier = dayCell.identifier

            this.delegate._reuseDayCell(dayCell, identifier);
            dayCell.removeFromSuperview();
        }
    
        this._dayViews = [];
        this._dayViewIndex = 0;

        this._setupDays();
    }

    private _dayCellAtDate(date) {
        let dv = this.delegate._cellDayAtDate(MIODateCopy(date));
        this._dayViewIndex++;

        return dv;
    }

    private _setupDays() {
        
        this.firstDate = new Date(this._year, this._month, 1); 
        this.lastDate = new Date(this._year, this._month + 1, 0);
        let currentDate = new Date(this._year, this._month, 1);

        let rowIndex = MIODateGetDayFromDate(currentDate) == 0 ? -1 : 0;                

        while (this.lastDate >= currentDate) {
            let dayView = this._dayCellAtDate(currentDate);
            this._dayViews.push(dayView);
            this.addSubview(dayView);
            dayView.setSelected(false);
            dayView.setDate(currentDate);

            // Calculate rows
            if (MIODateGetDayFromDate(dayView.date) == 0)
                rowIndex++;

            dayView.weekRow = rowIndex;            

            currentDate.setDate(currentDate.getDate() + 1);
        }

        this._weekRows = rowIndex + 1;

        this.setNeedsDisplay();
    }

    layoutSubviews() {
        // Layout days
        let x = 0;
        let y = 0;
        let w = this.getWidth() / 7;
        let h = w;

        // Offset x mapping index by day
        let offsetX = [0, w, w * 2, w * 3, w * 4, w * 5, w * 6];

        for (let index = 0; index < this._dayViews.length; index++) {
            let dv = this._dayViews[index];

            x = offsetX[MIODateGetDayFromDate(dv.date)];
            y = dv.weekRow * h;
            
            dv.setFrame(MIORect.rectWithValues(x, y, w, h));
            dv.layoutSubviews();
        }

        let contentHeight = (this._weekRows * h) + 2;
        this.setHeight(contentHeight);
    }    
}

export class MUICalendarDayCell extends MUIView {
    
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
        MUICoreLayerRemoveStyle(this.layer, "view");
        MUICoreLayerAddStyle(this.layer, "day-cell");
        this._setupLayer();
    }

    initWithLayer(layer, owner, options?){
        super.initWithLayer(layer, owner, options);

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

    private _setupLayer(){

        if (this.dayLabel == null){

            this.dayLabel = new MUILabel();
            this.dayLabel.init();
            MUICoreLayerRemoveStyle(this.dayLabel.layer, "view");
            MUICoreLayerAddStyle(this.dayLabel.layer, "day-label");
            this.addSubview(this.dayLabel);    
        }

        // var instance = this;
        // this.layer.onclick = function () {
        //         instance._onClick.call(instance);
        // }        
    }

    // private _onClick() {
    //     this.setSelected(true);
    // }
    setDate(date: Date) {
        this._date = new Date(date.getTime());

        this._day = date.getDate();
        this._month = date.getMonth();
        this._year = date.getFullYear();

        let today = new Date();
        let d = today.getDate();
        let m = today.getMonth();
        let y = today.getFullYear();

        this.dayLabel.text = date.getDate();        

        let isToday = (this._day == d && this._month == m && this._year == y);
        this.setToday(isToday);
    }

    setToday(value:boolean){
        if (value == true){
            MUICoreLayerAddStyle(this.layer, "today");
        }
        else {
            MUICoreLayerRemoveStyle(this.layer, "today");            
        }        
    }

    setSelected(value:boolean){

        if (this._selected == value) return;                        

        this.willChangeValue("selected");
        this._selected = value;
        if (value == true)
            MUICoreLayerAddStyle(this.layer, "selected");
        else 
            MUICoreLayerRemoveStyle(this.layer, "selected");
        this.didChangeValue("selected");
    }
}

export class MUICalendarView extends MUIView{
    
    dataSource = null;
    delegate = null;  

    //private collectionView:MUICollectionView = null;

    init(){
        super.init();
        MUICoreLayerAddStyle(this.layer, "calendar-view");
        this.setup();
    }

    initWithLayer(layer, owner, options){
        super.initWithLayer(layer, owner, options);
        
        if (layer.childNodes.length > 0) {
            for (let index = 0; index < layer.childNodes.length; index++) {
                let subLayer = layer.childNodes[index];

                if (subLayer.tagName != "DIV")
                    continue;

                //this.scanLayerNodes(subLayer, owner);

                if (subLayer.getAttribute("data-day-cell-identifier") != null) {
                    this.addDayCellLayer(subLayer, owner);
                }
            }
        }        

        this.setup();
    }

    private cellPrototypes = {};
    private addDayCellLayer(layer, owner){
        let identifier = layer.getAttribute("data-day-cell-identifier");
        let dc = new MUICalendarDayCell();
        dc.initWithLayer(layer, owner);
        dc.setHidden(true);
        this.cellPrototypes[identifier] = dc;
    }

    private addDefaultDayCell(){
        let dc = new MUICalendarDayCell();
        dc.init();
        dc.setHidden(true);
        this.cellPrototypes["__DEFAULT__"] = dc;
    }

    private header:MUICalendarHeader = null;
    private daysView:MUICalendarDaysView = null;
    private setup(){
        if (this.header == null) {
            this.header = new MUICalendarHeader();
            this.header.initWithDelegate(this);              
            this.addSubview(this.header);
        }        

        if (this.daysView == null) {
            this.daysView = new MUICalendarDaysView();
            this.daysView.initWithDelegate(this);   
            this.addSubview(this.daysView);         
        }

        this.addDefaultDayCell();
    }

    setNavBarHidden(value:boolean){
        this.header.setNavBarHidden(value);
    }

    // Calendar header delegate
    monthAndDateDidChange(month, year){
        this.selectedMonth = month;
        this.selectedYear = year;
        this.daysView.setMonthAndYear(month, year);
    }

    private selectedMonth = null;
    private selectedYear = null;
    setMonthAndYear(month, year){
        this.selectedMonth = month;
        this.selectedYear = year;
        this.header.setMonth(month);
        this.header.setYear(year);
        this.daysView.setMonthAndYear(month, year);
    }

    reloadData(){
    }

    layoutSubviews(){
        super.layoutSubviews();

        if (this.selectedMonth == null || this.selectedYear == null){
            
            let today = MIODateToday();
            if (this.selectedMonth == null) this.selectedMonth = MIODateGetMonthFromDate(today);
            if (this.selectedYear == null) this.selectedYear = MIODateGetYearFromDate(today);
            this.setMonthAndYear(this.selectedMonth, this.selectedYear); 
        }
    }

    private visibleDayCells = {};
    private _cellDayAtDate(date:Date){
        let dayCell = null;
        if (this.dataSource != null && typeof this.dataSource.dayCellAtDate === "function")
            dayCell = this.dataSource.dayCellAtDate(this, date);
        
        if (dayCell == null){ //Standard cell
            dayCell = this.dequeueReusableDayCellWithIdentifier();
        }

        let d:string = MIODateGetDateString(date);
        this.visibleDayCells[d] = dayCell;

        return dayCell;
    }

    cellDayAtDate(date:Date):MUICalendarDayCell{
        let d:string = MIODateGetDateString(date);
        return this.visibleDayCells[d];
    }

    selectDayCellAtDate(date:Date){
        let cell = this.cellDayAtDate(date);
        if (cell.selected == true) return;
        if (cell != null) this._didChangeDayCellSelectedValue(cell);
    }

    deselectDayCellAtDate(date:Date){
        let cell = this.cellDayAtDate(date);
        if (cell.selected == false) return;
        if (cell != null) this._didChangeDayCellSelectedValue(cell);
    }

    private reusableDayCells = {};
    _reuseDayCell(cell, identifier?:string){
        let id = identifier ? identifier : "__DEFAULT__";
        let cells = this.reusableDayCells[id];
        if (cells == null){
            cells = [];
            this.reusableDayCells[id] = cells;
        }

        cells.addObject(cell);

        let ds = MIODateGetDateString(cell.date);
        delete this.visibleDayCells[ds];
    }
    
    dequeueReusableDayCellWithIdentifier(identifier?:string){
        let id = identifier ? identifier : "__DEFAULT__";

        let dv:MUICalendarDayCell = null;
        
        let cells = this.reusableDayCells[id];
        if (cells != null && cells.length > 0){
            dv = cells[0];
            cells.removeObjectAtIndex(0);
        }
        else
        {
            //instance creation here
            let item:MUICalendarDayCell = this.cellPrototypes[id];
            if (item == null) throw new Error("Calendar day identifier doesn't exist.");
            
            let layer = item.layer.cloneNode(true);            
            dv = new MUICalendarDayCell();            
            //dv = item.copy();
            dv.initWithLayer(layer, this);
            dv.setHidden(false);
            dv.awakeFromHTML();

            // Register for selection
            let tapGesture = new MUITapGestureRecognizer();
            tapGesture.initWithTarget(this, this.gestureDidRecognize);
            dv.addGestureRecognizer(tapGesture);
            dv.addObserver(this, "selected");            
        }

        return dv;
    }

    private gestureDidRecognize(gesture:MUIGestureRecognizer){
        if (gesture.state == MUIGestureRecognizerState.Ended) {
            let dayCell:MUICalendarDayCell = gesture.view as MUICalendarDayCell;
            //dayCell.selected = true;
            this._didChangeDayCellSelectedValue(dayCell);
        }
    }

    private selectedDayCell:MUICalendarDayCell = null;
    private selectedDate:Date = null;
    private _didChangeDayCellSelectedValue(dayCell:MUICalendarDayCell) {

        if (dayCell.selected == false) {

            let canSelect = true;
            if (this.delegate != null && typeof this.delegate.canSelectDate === "function"){            
                canSelect = this.delegate.canSelectDate.call(this.delegate, this, dayCell.date);
            }

            if (canSelect == false) return; 

            if(this.selectedDayCell != null && this.selectedDayCell !== dayCell) {                
                this.selectedDayCell.setSelected(false);
                if (this.delegate != null && typeof this.delegate.didDeselectDayCellAtDate === "function")
                this.delegate.didDeselectDayCellAtDate.call(this.delegate, this, this.selectedDayCell.date);
            }

            this.selectedDate = dayCell.date;
            this.selectedDayCell = dayCell;            
            this.selectedDayCell.setSelected(true);            

            if (this.delegate != null && typeof this.delegate.didSelectDayCellAtDate === "function"){                                
                this.delegate.didSelectDayCellAtDate.call(this.delegate, this, dayCell.date);
            }    
        }
    }
}