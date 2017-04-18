/**
 * Created by godshadow on 11/3/16.
 */

/// <reference path="MUIScrollView.ts" />
/// <reference path="MUILabel.ts" />

function _MIOCCoreLoadTextFile(href) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", href, false);
    xmlhttp.send();
    var response = xmlhttp.responseText;
    return response;
}

function _MIOLayerFromResource(url, css, elementID) {
    var htmlString = _MIOCCoreLoadTextFile(url);
    var parser = new DOMParser();
    var html = parser.parseFromString(htmlString, "text/html");
    //var styles = html.styleSheets;
    //if (css != null)
    //MIOCoreLoadStyle(css);
    return (html.getElementById(elementID));
}


class MUICalendarCell extends MUIView {
    date = null;

    initWithLayer(layer, options?) {
        super.initWithLayer(layer, options);

        var instance = this;
        this.layer.onclick = function () {
            if (instance.parent.delegate != null)
                instance.parent.delegate.cellDidSelectedForCalendar.call(instance.parent, instance.date);
        }
    }
}

class MUICalendarDayCell extends MUIView {
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

    init() {
        super.init();

        this.layer.style.background = "";
        this.layer.classList.add("calendarview_day_cell");

        this._titleLabel = new MUILabel();
        this._titleLabel.init();
        this.addSubview(this._titleLabel);

        this._titleLabel.layer.style.background = "";
        this._titleLabel.layer.style.left = "";
        this._titleLabel.layer.style.top = "";
        this._titleLabel.layer.style.width = "";
        this._titleLabel.layer.style.height= "";
        this._titleLabel.layer.classList.add("calendarview_day_title");

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

        this._titleLabel.text = date.getDate();
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

        this._dayViewIndex = 0;

        this._setupHeader();
        this._setupDays();
    }

    private _setupHeader() {
        this._headerTitleLabel.text = MIODateGetStringForMonth(this._month) + " " + this._year;
    }

    private _dequeueReusableDayView() {

        var dv = null;
        if (this._dayViewIndex < this._dayViews.length) {
            dv = this._dayViews[this._dayViewIndex];
        }
        else {
            dv = new MUICalendarDayCell();
            dv.init();
            this._dayViews.push(dv);
            this.addSubview(dv);

            // Register for selection
            dv.addObserver(this._delegate, "selected");
        }

        this._dayViewIndex++;

        dv.setHidden(false);
        return dv;
    }

    private _setupDays() {
        var lastDate = new Date(this._year, this._month + 1, 0);
        var currentDate = new Date(this._year, this._month, 1);

        var rowIndex = MIODateGetDayFromDate(currentDate) == 0 ? -1 : 0;

        while (lastDate >= currentDate) {
            var dayView = this._dequeueReusableDayView();
            dayView.setDate(currentDate);

            // Calculate rows
            if (MIODateGetDayFromDate(dayView.date) == 0)
                rowIndex++;

            dayView.weekRow = rowIndex;

            currentDate.setDate(currentDate.getDate() + 1);
        }

        for (var index = this._dayViewIndex; index < this._dayViews.length; index++){

            var v = this._dayViews[index];
            v.setHidden(true);
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
        var h = (this.getHeight() - headerHeight) / this._weekRows;

        // Offset x maping by day index
        var marginX = 4;
        var marginW = marginX * 2;
        var offsetX = [marginX, w + marginX, (w * 2) + marginX, (w * 3) + marginX, (w * 4) + marginX, (w * 5) + marginX, (w * 6) + marginX];

        var marginY = 4;
        var marginH = marginY * 2;

        for (var index = 0; index < this._dayViews.length; index++) {
            var dv = this._dayViews[index];

            x = offsetX[MIODateGetDayFromDate(dv.date)];
            y = headerHeight + (dv.weekRow * h);

            dv.setFrame(MIOFrame.frameWithRect(x, y, (w - marginW), (h - marginW)));

            dv.layout();
        }
    }
}

class MUICalendarView extends MUIScrollView {
    
    dataSource = null;
    delegate = null;

    headers = [];
    cells = [];
    cellDates = [];

    private _today = new Date();
    public get today() { return this._today;}

    private _currentMonth = this._today.getMonth();

    private _cellPrototypes = {};

    private _views = [];

    private _scrollTopLimit = 0;
    private _scrollBottomLimit = 0;

    init(){

        super.init();
        this._setup();
    }

    initWithLayer(layer, owner, options?) {

        super.initWithLayer(layer, owner, options);
        this._setup();
    }

    private _setup(){
        
        this.showsVerticalScrollIndicator = false;
    }

    cellWithIdentifier(identifier) {
        var item = this.cellPrototypes[identifier];

        //instance creation here
        var className = item["class"];
        var cell = Object.create(window[className].prototype);
        cell.constructor.apply(cell, new Array("World"));

        var html = item["html"];
        var css = item["css"];
        var elID = item["id"];
        var layer = _MIOLayerFromResource(html, css, elID);
        cell.initWithLayer(layer);

        return cell;
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
        var currentDate = new Date(this.today.getFullYear(), currentMonth, 1);

        for (var index = 0; index < 3; index++) {
            var mv = new MUICalendarMonthView();
            mv.initWithMonth(currentMonth + index - 1, currentYear, this);
            this.addSubview(mv);
            this._views.push(mv);
        }
    }

    layout() {
        //super.layout();

        var marginLeft = 2;
        var marginRight = 2;
        var marginTop = 0;
        var marginBotton = 0;

        var w = this.getWidth() - (marginLeft + marginRight);
        var h = this.getHeight();

        var x = marginLeft;
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

        this.scrollToPoint(0, h);
    }    

    protected didScroll(deltaX, deltaY) {
        
        if (this.contentOffset.y < this._scrollTopLimit) {
            
            // Going up
            var firstMonth = this._views[0];
            var currentMonth = this._views[1];
            var lastMonth = this._views[2];

            lastMonth.setMonth(firstMonth.month - 1, firstMonth.year);

            this._views[0] = lastMonth;
            this._views[1] = firstMonth;
            this._views[2] = currentMonth;

            lastMonth.removeFromSuperview();
            this.addSubview(lastMonth, 0);

            lastMonth.layout();
        }
        else if (this.contentOffset.y > this._scrollBottomLimit) {
            // Going down

            var firstMonth = this._views[0];
            var currentMonth = this._views[1];
            var lastMonth = this._views[2];

            firstMonth.setMonth(lastMonth.month + 1, lastMonth.year);

            this._views[0] = currentMonth;
            this._views[1] = lastMonth;
            this._views[2] = firstMonth;

            firstMonth.removeFromSuperview();
            this.addSubview(firstMonth);

            firstMonth.layout();
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
            if (typeof this.delegate.canSelectDate === "function"){            
                canSelect = this.delegate.canSelectDate.call(this.delegate, dayCell.date);
            }

            if (canSelect == true && typeof this.delegate.didSelectDayCellAtDate === "function"){
                this.delegate.didSelectDayCellAtDate(this.delegate, dayCell, dayCell.date);
            }    
        }
    }

    scrollToDate(date: Date) {
        // TODO
    }

}

function MIOCalendarGetStringFromDate(date) {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = date.getDate().toString();

    var d = yyyy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0]); // padding

    return d;
}

