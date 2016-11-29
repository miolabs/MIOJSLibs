/**
 * Created by godshadow on 29/09/2016.
 */
/// <reference path="MIOObject.ts" />
var MIOUserDefaults = (function () {
    function MIOUserDefaults() {
        if (MIOUserDefaults._sharedInstance) {
            throw new Error("Error: Instantiation failed: Use standardUserDefaults() instead of new.");
        }
        MIOUserDefaults._sharedInstance = this;
    }
    MIOUserDefaults.standardUserDefaults = function () {
        return MIOUserDefaults._sharedInstance;
    };
    MIOUserDefaults.prototype.setBooleanForKey = function (key, value) {
        var v = value ? "1" : "0";
        this.setValueForKey(key, v);
    };
    MIOUserDefaults.prototype.booleanForKey = function (key) {
        var v = this.valueForKey(key);
        return v == "1" ? true : false;
    };
    MIOUserDefaults.prototype.setValueForKey = function (key, value) {
        localStorage.setItem(key, value);
    };
    MIOUserDefaults.prototype.valueForKey = function (key) {
        return localStorage.getItem(key);
    };
    MIOUserDefaults.prototype.removeValueForKey = function (key) {
        localStorage.removeItem(key);
    };
    MIOUserDefaults._sharedInstance = new MIOUserDefaults();
    return MIOUserDefaults;
}());
