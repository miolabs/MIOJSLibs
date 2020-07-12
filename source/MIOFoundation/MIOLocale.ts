import { MIOObject } from "./MIOObject";
import { NSCalendar } from "./NSCalendar";

/**
 * Created by godshadow on 30/3/16.
 */

export var NSLocaleCalendar = "NSLocaleCalendar";
var _mio_currentLocale;

export class MIOLocale extends MIOObject
{
    languageCode = "es";
    countryCode = "ES";

    public static currentLocale():MIOLocale{
        if (_mio_currentLocale == null) {
            _mio_currentLocale = new MIOLocale();
            _mio_currentLocale.initWithLocaleIdentifier("es_ES");
        }
        //return MIOWebApplication.sharedInstance().currentLanguage;

        return _mio_currentLocale;
    }

    public static _setCurrentLocale(localeIdentifier:string){
        _mio_currentLocale = new MIOLocale();
        _mio_currentLocale.initWithLocaleIdentifier(localeIdentifier);
    }

    initWithLocaleIdentifier(identifer:string) {

        let array = identifer.split("_");
        if (array.length == 1) {
            this.languageCode = array[0];
        }
        else if (array.length == 2) {
            this.languageCode = array[0];
            this.countryCode = array[1];
        }
    }

    objectForKey(key:string){
        switch(key){
            case NSLocaleCalendar:
                return this.calendar();                
        }

        return null;
    }

    private _calendar:NSCalendar = null; 
    private calendar():NSCalendar {
        if (this._calendar != null) return this._calendar;

        this._calendar = new NSCalendar();
        this._calendar.init();

        return this._calendar;
    }

    get decimalSeparator():string{

        let ds = "";
        
        switch (this.countryCode) {

            case "ES":
            case "NL":
                ds =  ",";
                break;

            case "US":
            case "UK":
            case "AE":  
            case "PH":  
            case "GQ":
            case "AW":                                        
                ds =  ".";
                break;
        }

        return ds;
    }

    get currencySymbol():string {

        let cs = "";

        switch(this.countryCode) {

            case "ES":
            case "DE":
            case "FR":
            case "IT":
            case "NL":
                cs = "€";
                break;

            case "US":
                cs = "$";
                break;

            case "UK":
                cs = "£";
                break;

            case "PH":
                cs = "₱";
                break;

            case "AW":
                cs = "ƒ";
                break;
        }

        return cs;
    }

    get currencyCode(){
        let cc = "";

        switch(this.countryCode){
            case "ES":                
            case "DE":
            case "FR":
            case "IT":
            case "NL":            
                cc = "EUR";
                break;

            case "US":
                cc = "USD";
                break;

            case "UK":
                cc = "GBP";
                break;

            case "AE":
                cc = "AED";
                break;

            case "PH":
                cc = "PHP";
                break;

            case "GQ":
                cc = "FCFA";
                break;

            case "AW":
                cc = "AWG";
                break;        
        }

        return cc;
    }

    get groupingSeparator():string {

        let gs = "";

        switch(this.countryCode){

            case "ES":
            case "NL":
                gs = ".";
                break;

            case "US":
            case "UK":
            case "AE":
            case "PH":
            case "GQ":
            case "AW":
                gs = ",";
                break;
        }

        return gs;
    }
}



