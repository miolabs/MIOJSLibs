
/// <reference path="MIOFormatter.ts" />

enum MIODateFormatterStyle {
    NoStyle,
    ShortStyle,
    MediumStyle,
    LongStyle,
    FullStyle
}

class MIODateFormatter extends MIOFormatter {

    dateStyle = MIODateFormatterStyle.ShortStyle;
    timeStyle = MIODateFormatterStyle.ShortStyle;    

    dateFromString(str:string):Date {

        var result, value, dateString;

        if(!str || str.length <= 0) return null;
        
        [result, value, dateString] = this._parse(str);
        if (result == true) {
            var date = Date.parse(dateString);
            return  isNaN(date) == false? new Date(dateString) : null;
        }

        return null;
    }

    stringFromDate(date:Date):string {

        if (date == null) return null;

        var str = "";
        
        switch (this.dateStyle) {

            case MIODateFormatterStyle.ShortStyle:
                str = this._shortDateStyle(date);
                break;

            case MIODateFormatterStyle.FullStyle:
                str = this._fullDateStyle(date);
                break;
        }        

        if (this.dateStyle != MIODateFormatterStyle.NoStyle && this.timeStyle != MIODateFormatterStyle.NoStyle)
            str += " ";

        switch (this.timeStyle) {
            
            case MIODateFormatterStyle.ShortStyle:
                str += this._shortTimeStyle(date);
                break;
        }

        return str;
    }

    isPartialStringValid(str:string):[boolean, string]{

        if (str.length == 0) return [true, str];

        var result, newStr;
        [result, newStr] = this._parse(str);                

        return [result, newStr];
    }

    private _parse(str:string):[boolean, string, string]{

        var result, newStr, value;
        var dateString = "";

        if (this.dateStyle != MIODateFormatterStyle.NoStyle) {
            [result, newStr, value] = this._parseDate(str);   
            if (result == false) 
                return [result, newStr, value];            
        }
        else {
            let today = new Date();
            dateString = this.iso8601DateStyle(today);
        }                                     

        if (this.timeStyle != MIODateFormatterStyle.NoStyle) {
            [result, newStr, value] = this._parseTime(str);
            if (result == false) {
                return [result, newStr, value];
            }
            dateString += " " + value;
        }
        
        return [result, newStr, dateString];
    }

    private _parseDate(str:string):[boolean, string, string]{

        var parseString = "";
        var step = 0;

        var dd = "";
        var mm = "";
        var yy = "";

        // Check dd-mm-yy or dd-mm-yyyy
        for (var index = 0; index < str.length; index++) {
            var ch = str[index];

            if (ch == "-" || ch == "." || ch == "/")
            {
                // Next step
                if (parseString.length == 0) return [false, parseString, ""];
                parseString += "/";
                step++;
            }
            else 
            {
                var result, value;
                
                switch(step) {

                    case 0: //dd
                        [result, dd] = this._parseDay(ch, dd);
                        break;

                    case 1: // mm
                        [result, mm] = this._parseMonth(ch, mm);
                        break;

                    case 2: // yy or yyyy
                        [result, yy] = this._parseYear(ch, yy);
                        break;
                }

                if (result == true)
                    parseString += ch;
                else 
                    return [false, parseString, ""];
            }            
        }

        var dateString = (yy[3]? yy : ("20" + yy)) + "-" + mm + "-" + dd;
        return [true, parseString, dateString];
    }

    private _parseDay(ch, dd):[boolean, string] {

        var c = parseInt(ch);
        if (isNaN(c)) return [false, dd];
        var v = parseInt(dd + ch);
        if (v < 1 || v > 31) return [false, dd];
        return [true, dd + ch];
    }
    
    private _parseMonth(ch, mm):[boolean, string] {

        var c = parseInt(ch);
        if (isNaN(c)) return [false, mm];
        var v = parseInt(mm + ch);
        if (v < 1 || v > 12) return [false, mm];
        return [true, mm + ch];
    }

    private _parseYear(ch, yy):[boolean, string]{

        var c = parseInt(ch);
        if (isNaN(c)) return [false, yy];
        var v = parseInt(yy + ch);
        if (v > 3000) return [false, yy];
        return [true, yy + ch];
    }

    protected iso8601DateStyle(date:Date)
    {
        let dd = date.getDate().toString();
        let mm = (date.getMonth() + 1).toString();
        let yy = date.getFullYear().toString();        

        return yy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0]);
    }

    private _shortDateStyle(date:Date, separatorString?:string){
        
        let separator = separatorString ? separatorString : "/";

        let d = date.getDate().toString();
        let m = (date.getMonth() + 1).toString();
        let y = date.getFullYear().toString();        

        return (d[1]?d:0+d) + separator + (m[1]?m:"0"+m) + separator + y;
    }

    private _fullDateStyle(date:Date){

        var day = _MIODateFormatterStringDays[date.getDay()];
        var month = _MIODateFormatterStringMonths[date.getMonth()];

        return day + ", " + date.getDate() + " of " + month + " of " + date.getFullYear();
    }

    private _parseTime(str:string):[boolean, string, string]{

        var parseString = "";
        var step = 0;

        var hh = "";
        var mm = "";
        var ss = "";

        // Check dd-mm-yy or dd-mm-yyyy
        for (var index = 0; index < str.length; index++) {
            var ch = str[index];

            if (ch == ":" || ch == ".")
            {
                // Next step
                if (parseString.length == 0) return [false, parseString, ""];
                parseString += ":";
                step++;
            }
            else 
            {
                var result, value;
                
                switch(step) {

                    case 0: //hh
                        [result, hh] = this._parseHour(ch, hh);
                        break;

                    case 1: // mm
                        [result, mm] = this._parseMinute(ch, mm);
                        break;

                    case 2: // ss
                        [result, ss] = this._parseSecond(ch, ss);
                        break;
                }

                if (result == true)
                    parseString += ch;
                else 
                    return [false, parseString, ""];
            }            
        }

        var hourString = (hh[1]? hh : ("0" + hh));
        if (mm.length > 0)
            hourString += ":" + (mm[1]?mm:("0"+mm));
        else 
            hourString += ":00";
        
        if (ss.length > 0)
            hourString += ":" + (ss[1]?ss:("0"+ss));
        else 
            hourString += ":00";
        
        return [true, parseString, hourString];
    }

    private _parseHour(ch, hh):[boolean, string] {

        var c = parseInt(ch);
        if (isNaN(c)) return [false, hh];
        var v = parseInt(hh + ch);
        if (v < 0 || v > 23) return [false, hh];
        return [true, hh + ch];
    }

    private _parseMinute(ch, mm):[boolean, string] {

        var c = parseInt(ch);
        if (isNaN(c)) return [false, mm];
        var v = parseInt(mm + ch);
        if (v < 0 || v > 59) return [false, mm];
        return [true, mm + ch];
    }

    private _parseSecond(ch, ss):[boolean, string] {

        var c = parseInt(ch);
        if (isNaN(c)) return [false, ss];
        var v = parseInt(ss + ch);
        if (v < 0 || v > 59) return [false, ss];
        return [true, ss + ch];
    }

    protected iso8601TimeStyle(date:Date){
        
        let hh = date.getHours().toString();
        let mm = date.getMinutes().toString();
        let ss = date.getSeconds().toString();

        return (hh[1]?hh:"0" + hh[0]) + ":" + (mm[1]?mm:"0" + mm[0]) + ":" + (ss[1]?ss:"0" + ss[0]);
    }

    private _shortTimeStyle(date:Date) {

        var h = date.getHours();
        var m = date.getMinutes();

        return h + ":" + m;
    }

}

var _MIODateFormatterStringDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var _MIODateFormatterStringMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
