/**
 * Created by godshadow on 11/3/16.
 */

/// <reference path="MUIView.ts" />

enum MUICalendarDayCellType
{
    Default,
    Custom
}

class MUICalendarDayCell extends MUIView {
    
    type = MUICalendarDayCellType.Default;
    identifier = null;
    weekRow: number;

    private _date: Date = null;
    get date(): Date {
        return this._date;
    }

    private _day = null;
    private _month = null;
    private _year = null;

    private _titleLabel = null;

    private _selected = false;
    set selected(value:boolean) {this.setSelected(value);}
    get selected() {return this._selected;}

    private _isToday = false;

    init() {
        super.init();

        this.type = MUICalendarDayCellType.Default;
        this.layer.style.background = "";

        this._titleLabel = new MUILabel();
        this._titleLabel.init();
        this.addSubview(this._titleLabel);

        this._titleLabel.layer.style.background = "";
        this._titleLabel.layer.style.left = "";
        this._titleLabel.layer.style.top = "";
        this._titleLabel.layer.style.width = "";
        this._titleLabel.layer.style.height= "";

        this._setupLayer();
    }

    initWithLayer(layer, owner, options?)
    {
        super.initWithLayer(layer, owner, options);
        this.type = MUICalendarDayCellType.Custom;
        this._setupLayer();
    }

    private _setupLayer()
    {
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
            this._titleLabel.text = date.getDate();

        var isToday = (this._day == d && this._month == m && this._year == y);
        this.setToday(isToday);
    }

    setToday(value:boolean)
    {
        if (this.type == MUICalendarDayCellType.Custom) return;

        if (value)
        {
            this.layer.classList.remove("calendarview_day_cell");
            this._titleLabel.layer.classList.remove("calendarview_day_title");
            this.layer.classList.add("calendarview_today_day_cell");
            this._titleLabel.layer.classList.add("calendarview_today_day_title");
        }
        else 
        {
            this.layer.classList.add("calendarview_day_cell");
            this._titleLabel.layer.classList.add("calendarview_day_title");
            this.layer.classList.remove("calendarview_today_day_cell");
            this._titleLabel.layer.classList.remove("calendarview_today_day_title");            
        }        

    }

    setSelected(value:boolean){

        if (this._selected == value) return;
        
        this.willChangeValue("selected");
        this._selected = value;
        this.didChangeValue("selected");
    }
}

class MUICalendarMonthView extends MUIView {
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
        this.addSubview(this._header);

        this._headerTitleLabel = new MUILabel();
        this._headerTitleLabel.initWithLayer(MUICoreLayerCreateWithStyle("calendarview_month_header_title"), this);
        this._header.addSubview(this._headerTitleLabel);

        var w = 100 / 7;
        for (var index = 0; index < 7; index++){

                var dayLabel = new MUILabel();
                dayLabel.initWithLayer(MUICoreLayerCreateWithStyle("calendarview_month_header_day_title"), this);
                dayLabel.layer.style.left = (w * index) + "%";
                dayLabel.layer.style.width = w + "%";
                dayLabel.text = MIODateGetStringForDay(index).substr(0, 2);
                this._header.addSubview(dayLabel);
        }

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

        var dv = this._delegate._cellDayAtDate(date);
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

    layout() {
        // Layout header
        var headerHeight = this._header.getHeight() + 1;

        // Layout days
        var x = 0;
        var y = 0;
        var w = this.frame.size.width / 7;
        var h = (this.getHeight() - headerHeight - this.cellSpacingY) / this._weekRows;

        // Offset x mapping index by day
        var marginX = this.cellSpacingX / 2;
        var marginW = marginX * 2;
        var offsetX = [marginX, w + marginX, (w * 2) + marginX, (w * 3) + marginX, (w * 4) + marginX, (w * 5) + marginX, (w * 6) + marginX];

        var marginY = this.cellSpacingY / 2;
        var marginH = marginY * 2;

        for (var index = 0; index < this._dayViews.length; index++) {
            var dv = this._dayViews[index];

            x = offsetX[MIODateGetDayFromDate(dv.date)];
            y = headerHeight + (dv.weekRow * h) + marginY;

            dv.setFrame(MIOFrame.frameWithRect(x, y, (w - marginW), (h - marginH)));

            dv.layout();
        }
    }
}

class MUICalendarView extends MUIScrollView {
    
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

    private _scrollTopLimit = 0;
    private _scrollBottomLimit = 0;

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

                if (subLayer.getAttribute("data-cell-identifier") != null) {
                    this._addCellPrototypeWithLayer(subLayer);
                    subLayer.style.display = "none";
                }
            }
        }
    }

    private _setup(){
        
        this.showsVerticalScrollIndicator = false;
    }

    private _addCellPrototypeWithLayer(subLayer) 
    {
        var cellIdentifier = subLayer.getAttribute("data-cell-identifier");
        var cellClassname = subLayer.getAttribute("data-class");
        if (cellClassname == null) cellClassname = "MUICalendarCell";

        var item = {};
        item["class"] = cellClassname;
        item["layer"] = subLayer;

        this._cellPrototypes[cellIdentifier] = item;
    }

    _reuseDayCell(cell, identifier?:string)
    {
        if (identifier == null)
            this._reusableDayCells.push(cell);
        else 
        {
            var array = this._reusablePrototypeDayCells[identifier];
            if (array == null)
            {
                array = [];
                this._reusablePrototypeDayCells[identifier] = array;
            }

            array.push(cell);

            delete this._visibleDayCells[cell.date];
        }
    }

    private _cellDayAtDate(date)
    {
        var dayCell = null;
        if (this.dataSource != null && typeof this.dataSource.dayCellAtDate === "function")
            dayCell = this.dataSource.dayCellAtDate(this, date);
        
        if (dayCell == null)
        {
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

    cellDayAtDate(date)
    {
        return this._visibleDayCells[date];
    }

    dequeueReusableDayCellWithIdentifier(identifier?:string)
    {
        var dv = null;

        if (identifier != null)
        {
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
                if (item == null) throw ("Calendar day identifier doesn't exist.");
                
                var className = item["class"];
                dv = Object.create(window[className].prototype);
                dv.constructor.apply(dv);

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
            if (this._reusableDayCells.length > 0)
            {
                dv = this._reusableDayCells[0];
                this._reusableDayCells.splice(0, 1);
            }
            else 
            {
                dv = new MUICalendarDayCell();
                dv.init();
                
                // Register for selection
                dv.addObserver(this, "selected");                        
            }                        
        }

        return dv;
    }

    reloadData() {
        // Remove all subviews
        for (var index = 0; index < this._views.length; index++) {
            var view = this._views[index];
            view.removeFromSuperview();
        }

        this._views = [];

        var currentYear = this.today.getFullYear();
        var currentMonth = this.today.getMonth() - 1;
                        
        if (this.minDate != null) {
            
            var firstDay = new Date(currentYear, currentMonth + 1, 1);
            if (firstDay <= this.minDate)
                currentMonth += 1;
        }

        for (var index = 0; index < 3; index++) {
            var mv = new MUICalendarMonthView();
            mv.initWithMonth(currentMonth + index, currentYear, this);
            mv.cellSpacingX = this.horizontalCellSpacing;
            mv.cellSpacingY = this.verticalCellSpacing;
            this.addSubview(mv);
            this._views.push(mv);
        }

        this.setNeedsDisplay();
    }

    layout() {
        //super.layout();

        if (this._viewIsVisible == false) return;
        if (this.hidden == true) return;
        if (this._needDisplay == false) return;
        this._needDisplay = false;
        
        var w = this.getWidth() - this.horizontalCellSpacing;
        var h = this.getHeight();

        var x = 0;
        var y = 0;

        for (var index = 0; index < this._views.length; index++) {
            var mv = this._views[index];
            mv.setFrame(MIOFrame.frameWithRect(x, y, w, h));
            mv.layer.style.top = "";
            mv.layout();

            y += h;
        }

        var middle = h / 2;
        this._scrollTopLimit = middle;        
        this._scrollBottomLimit = h + middle;

        this.scrollToDate(this.today);
    }        

    protected didScroll(deltaX, deltaY) {
        
        if (this.contentOffset.y < this._scrollTopLimit) {
                        
            // Going up
            var firstMonth = this._views[0];
            var currentMonth = this._views[1];
            var lastMonth = this._views[2];

            if (this.minDate != null && firstMonth.firstDate <= this.minDate) return;

            lastMonth.setMonth(firstMonth.month - 1, firstMonth.year);

            this._views[0] = lastMonth;
            this._views[1] = firstMonth;
            this._views[2] = currentMonth;

            console.log("Offset y: " + this.contentOffset.y);

            lastMonth.removeFromSuperview();
            this.addSubview(lastMonth, 0);

            console.log("Offset y: " + this.contentOffset.y);

            lastMonth.layout();

            if (MIOCoreGetBrowser() == MIOCoreBrowserType.Safari) {
                var offsetY = this.getHeight() + this.contentOffset.y;
                this.scrollToPoint(0, offsetY);
            }
        }
        else if (this.contentOffset.y > this._scrollBottomLimit) {
            // Going down

            var firstMonth = this._views[0];
            var currentMonth = this._views[1];
            var lastMonth = this._views[2];

            if (this.maxDate != null && lastMonth.lastDate > this.maxDate) return;

            firstMonth.setMonth(lastMonth.month + 1, lastMonth.year);

            this._views[0] = currentMonth;
            this._views[1] = lastMonth;
            this._views[2] = firstMonth;
            
            var offsetY = this.contentOffset.y - this.getHeight();

            firstMonth.removeFromSuperview();
            this.addSubview(firstMonth);

            firstMonth.layout();

            if (MIOCoreGetBrowser() == MIOCoreBrowserType.Safari) {
                this.scrollToPoint(0, offsetY);
            }
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

            if (this.delegate == null) return;

            if (canSelect == true && typeof this.delegate.didSelectDayCellAtDate === "function"){
                if(this._selectedDayCell != null)
                    this._selectedDayCell.setSelected(false);
                
                this.selectedDate = dayCell.date;
                this._selectedDayCell = dayCell;
                
                this.delegate.didSelectDayCellAtDate.call(this.delegate, this, dayCell.date);
            }    
        }
    }

    scrollToDate(date: Date) {
        
        var firstMonthView = this._views[0];
        var firstMonth = firstMonthView.month;
        var currentMonth = date.getMonth();

        if (firstMonth < currentMonth)
        {
            var h = this.getHeight();
            var count = currentMonth - firstMonth;
            var y = h * count;
            this.scrollToPoint(0, y);
        }
    }

    deselectCellAtDate(date:Date){

        if (this.selectedDate == date)
            this._selectedDayCell.setSelected(false);
    }

}

function MIOCalendarGetStringFromDate(date) {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = date.getDate().toString();

    var d = yyyy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0]); // padding

    return d;
}

