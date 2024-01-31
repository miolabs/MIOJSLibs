import { MIOCoreGetBrowser, MIOCoreBrowserType } from "../MIOCore/platform/Web";
import { MIODateFormatter, MIODateFormatterStyle } from "./MIODateFormatter";

export class MIOISO8601DateFormatter extends MIODateFormatter {

    static iso8601DateFormatter():MIOISO8601DateFormatter {
        var df = new MIOISO8601DateFormatter();
        df.init();

        return df;
    }

    timeZone = null;

    getObjectValueForString(str:string) {
        return this.dateFromString(str);
    }

    dateFromString(str:string):Date {

        if (str == null) return null;
        let dateString:string = str.replace("T", " ");
        if (dateString.length > 19) dateString = dateString.substr(0, 19);
        
        // if (MIOCoreGetBrowser() == MIOCoreBrowserType.Safari){
        //     dateString = str.split('-').join("/");                        
        // }

        let timestamp = Date.parse(dateString);
        let d = null;
        if (isNaN(timestamp) == false){
            d = new Date(dateString);
        }
        else {
            console.log("DATE FORMATTER: Error, invalid date");            
        }                    

        return d;
    }

    stringForObjectValue(value:any):string {
        
        let date = value as Date;
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
