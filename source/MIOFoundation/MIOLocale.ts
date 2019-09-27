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
            case "NL":
                ds =  ",";
                break;

            case "US":
            case "UK":
            case "AE":  
            case "PH":  
            case "GQ":                    
                ds =  ".";
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

            case "PH":
                cs = "₱";
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
                break;

            case "PH":
                cc = "PHP";
                break;

            case "GQ":
                cc = "FCFA";
                break;
        
        }

        return cc;
    }

    get groupingSeparator():string {

        let gs = "";

        switch(this.countryIdentifier){

            case "ES":
            case "NL":
                gs = ".";
                break;

            case "US":
            case "UK":
            case "AE":
            case "PH":
            case "GQ":
                gs = ",";
                break;
        }

        return gs;
    }
}



