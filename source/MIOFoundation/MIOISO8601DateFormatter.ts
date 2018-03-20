import { MIOCoreGetBrowser, MIOCoreBrowserType } from "../MIOCorePlatforms";
import { MIODateFormatter, MIODateFormatterStyle } from "./MIODateFormatter";

export class MIOISO8601DateFormatter extends MIODateFormatter {

    static iso8601DateFormatter():MIOISO8601DateFormatter {
        var df = new MIOISO8601DateFormatter();
        df.init();

        return df;
    }

    timeZone = null;

    dateFromString(str:string):Date {

        if (str == null) return null;
        let dateString;
        if (MIOCoreGetBrowser() == MIOCoreBrowserType.Safari)
            dateString = str.split('-').join( "/");
        else 
            dateString = str;
        var d = new Date(dateString);
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
