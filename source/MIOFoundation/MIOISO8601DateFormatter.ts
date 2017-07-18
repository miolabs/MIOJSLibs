
/// <reference path="MIODateFormatter.ts" />


class MIOISO8601DateFormatter extends MIODateFormatter {

    timeZone = null;

    dateFromString(str:string):Date {

        if (str == null) return null; 
        var d = new Date(str);
        if (d == null) 
            console.log("DATE FORMATTER: Error, invalid date");

        return d;
    }

    stringFromDate(date:Date):string {

        var str = "";

        if (date == null) return null;

        if (this.dateStyle != MIODateFormatterStyle.NoStyle) {
            str += this.iso8601DateStyle(date);
        }

        if (this.timeStyle != MIODateFormatterStyle.NoStyle){

            if (str.length > 0)
            str += " ";
            
            str += this.iso8601TimeStyle(date);
        }

        return str;
    }
}
