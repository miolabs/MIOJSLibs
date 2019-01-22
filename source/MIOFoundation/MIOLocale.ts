import { MIOObject } from "./MIOObject";

/**
 * Created by godshadow on 30/3/16.
 */

var _mio_currentLocale;

export class MIOLocale extends MIOObject
{
    languageIdentifier = "es";
    countryIdentifier = "ES";

    public static currentLocale(){
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
            this.languageIdentifier = array[0];
        }
        else if (array.length == 2) {
            this.languageIdentifier = array[0];
            this.countryIdentifier = array[1];
        }
    }

    get decimalSeparator():string{

        let ds = "";
        
        switch (this.countryIdentifier) {

            case "ES":
                ds =  ",";
                break;

            case "US":
                ds =  ".";
                break;

            case "UK":
                ds =  ".";
                break;     
                
            case "AE":
                ds = ".";
                break;
        }

        return ds;
    }

    get currencySymbol():string {

        let cs = "";

        switch(this.countryIdentifier) {

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
        }

        return cs;
    }

    get currencyCode(){
        let cc = "";

        switch(this.countryIdentifier){
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
        }

        return cc;
    }

    get groupingSeparator():string {

        let gs = "";

        switch(this.countryIdentifier){

            case "ES":
                gs = ".";
                break;

            case "US":
                gs = ",";
                break;

            case "UK":
                gs = ",";
                break;

            case "AE":
                gs = ",";
                break;
        }

        return gs;
    }
}



