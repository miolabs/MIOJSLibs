import { MUIViewController } from "./MUIViewController";
import { MIOSize, MIODateGetStringForMonth } from "../MIOFoundation";
import { MUILabel } from "./MUILabel";
import { MUICalendarView } from "./MUICalendarView";

export class MUIDatePickerController extends MUIViewController
{
    delegate = null;
    tag = 0;
    
    private calendarView = null;    
    
    public get preferredContentSize(){
        return new MIOSize(320, 329);
    }

    viewDidLoad(){        
        this.view.setBackgroundRGBColor(255, 255, 255);

        this.calendarView = new MUICalendarView();
        this.calendarView.init();
        this.calendarView.dataSource = this;        
        this.calendarView.delegate = this;        
        this.view.addSubview(this.calendarView);

        this.calendarView.reloadData();
    }

    viewTitleForHeaderAtMonthForCalendar(calendar, currentMonth){
        let title = MIODateGetStringForMonth(currentMonth);
        let header = new MUILabel();
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

    // dayCellAtDate(calendar, date){
    //     var cell = calendar.dequeueReusableDayCellWithIdentifier(null);

    //     return cell;
    // }

    // Calendar Delegate methods
    didSelectDayCellAtDate(calendarView, date) {
        
        if (this.delegate != null && typeof this.delegate.didSelectDate === "function")
            this.delegate.didSelectDate(this, date);

        this.dismissViewController(true);
    }
}