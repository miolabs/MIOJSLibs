
/// <reference path="../MIOUI/MIOUI.ts" />
/// <reference path="../MIOUIX/MUIXCalendarView.ts" />

class MUIXDatePickerController extends MUIViewController
{
    delegate = null;
    private calendarView = null;    
    
    viewDidLoad(){
        
        this.view.setBackgroundRGBColor(255, 255, 255);

        this.calendarView = new MUIXCalendarView();
        this.calendarView.init();
        this.calendarView.dataSource = this;        
        this.calendarView.delegate = this;        

        this.calendarView.horizontalCellSpacing = 1;
        this.calendarView.verticalCellSpacing = 1;

        this.view.addSubview(this.calendarView);

        this.calendarView.reloadData();
    }

    viewTitleForHeaderAtMonthForCalendar(calendar, currentMonth)
    {
        var title = MIODateGetStringForMonth(currentMonth);
        var header = new MUILabel();
        header.init();
        header.setText(title);
        header.setTextAlignment("center");
        header.setHeight(30);
        header.setTextRGBColor(101, 100, 106);
        header.setBackgroundRGBColor(255, 255, 255);
        header.setFontSize(20);
        header.setFontStyle("bold");
        header.setFontFamily("SourceSansPro-Semibold, Source Sans Pro, sans-serif");

        return header;
    }

    dayCellAtDate(calendar, date)
    {
        var cell = calendar.dequeueReusableDayCellWithIdentifier(null);

        return cell;
    }

    // Calendar Delegate methods
    didSelectDayCellAtDate(calendarView, date) {
        
        if (this.delegate != null && typeof this.delegate.didSelectDate === "function")
            this.delegate.didSelectDate(this, date);

        this.dismissViewController(true);
    }

     public get preferredContentSize()
    {
        return new MIOSize(320, 320);
    }
}