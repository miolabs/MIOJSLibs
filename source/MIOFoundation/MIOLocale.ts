import { MIOObject } from "./MIOObject";

/**
 * Created by godshadow on 30/3/16.
 */

var _mio_currentLocale;

export class MIOLocale extends MIOObject
{
    languageIdentifier = "es";
    countryIdentifier = "ES";

    public static currentLocale()
    {
        if (_mio_currentLocale == null) {
            _mio_currentLocale = new MIOLocale();
            _mio_currentLocale.initWithLocaleIdentifier("es_ES");
        }
        //return MIOWebApplication.sharedInstance().currentLanguage;

        return _mio_currentLocale;
    }

    initWithLocaleIdentifier(identifer:string) {

        var array = identifer.split("_");
        if (array.length == 1) {
            this.languageIdentifier = array[0];
        }
        else if (array.length == 2) {
            this.languageIdentifier = array[0];
            this.countryIdentifier = array[1];
        }
    }

    get decimalSeparator():string{

        var ds;
        
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
        }

        return ds;
    }

    get currencySymbol():string {

        var cs;

        switch(this.countryIdentifier) {

            case "ES":
                cs =  "€";
                break;

            case "US":
                cs =  "$";
                break;
        }

        return cs;
    }

    get groupingSeparator():string {

        var gs;

        switch(this.countryIdentifier){

            case "ES":
                gs = ".";
                break;

            case "US":
                gs = ",";
                break;
        }

        return gs;
    }
}



