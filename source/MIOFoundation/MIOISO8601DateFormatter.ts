
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
            var dd = date.getDate().toString();
            var mm = (date.getMonth() + 1).toString();
            var yy = date.getFullYear().toString();        

            str += yy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0]);
        }

        if (this.timeStyle != MIODateFormatterStyle.NoStyle){

            if (str.length > 0)
            str += " ";
            
            var hh = date.getHours().toString();
            var mm = date.getMinutes().toString();
            var ss = date.getSeconds().toString();

            str += (hh[1]?hh:"0" + hh[0]) + ":" + (mm[1]?mm:"0" + mm[0]) + ":" + (ss[1]?ss:"0" + ss[0]);
        }

        return str;
    }
}
