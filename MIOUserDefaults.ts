/**
 * Created by godshadow on 29/09/2016.
 */


/// <reference path="MIOObject.ts" />

class MIOUserDefaults
{
    private static _sharedInstance:MIOUserDefaults = new MIOUserDefaults();

    constructor()
    {
        if (MIOUserDefaults._sharedInstance)
        {
            throw new Error("Error: Instantiation failed: Use standardUserDefaults() instead of new.");
        }
        MIOUserDefaults._sharedInstance = this;
    }

    public static standardUserDefaults():MIOUserDefaults
    {
        return MIOUserDefaults._sharedInstance;
    }

    setBooleanForKey(key, value:boolean)
    {
        var v = value ? "1" : "0";
        this.setValueForKey(key, v);
    }

    booleanForKey(key)
    {
        var v = this.valueForKey(key);
        return v == "1" ? true : false;
    }

    setValueForKey(key, value)
    {
        localStorage.setItem(key, value);
    }

    valueForKey(key)
    {
        return localStorage.getItem(key);
    }

    removeValueForKey(key)
    {
        localStorage.removeItem(key);
    }
}