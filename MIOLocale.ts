/**
 * Created by godshadow on 30/3/16.
 */

    /// <reference path="MIOCore.ts" />

class MIOLocale extends MIOObject
{
    constructor()
    {
        super();
    }

    public static currentLocale()
    {
        return MIOWebApplication.sharedInstance().currentLanguage;
    }
}
