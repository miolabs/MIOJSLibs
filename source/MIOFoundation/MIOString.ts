/**
 * Created by godshadow on 21/3/16.
 */

/// <reference path="MIO_Core.ts" />

var _MIOLocalizedStrings = null;

function MIOLocalizeString(key, defaultValue)
{
    var strings =  _MIOLocalizedStrings;
    if (strings == null)
        return defaultValue;

    var value = strings[key];
    if (value == null)
        return defaultValue;

    return value;
}

// interface String {
//     endsWith(searchString: string, endPosition?: number): boolean;
// }

/*
if ( typeof String.prototype.startsWith != 'function' ) {
    String.prototype.startsWith = function( str ) {
        return str.length > 0 && this.substring( 0, str.length ) === str;
    }
};

if ( typeof String.prototype.endsWith != 'function' ) {
    String.prototype.endsWith = function( str ) {
        return str.length > 0 && this.substring( this.length - str.length, this.length ) === str;
    }
};
*/
// String.prototype.startsWith = function( str ) {
//    return this.substring( 0, str.length ) === str;
//}

// String.prototype.endsWith = function(suffix) {
//     return this.indexOf(suffix, this.length - suffix.length) !== -1;
// };

function MIOStringHasPreffix(str, preffix)
{
    return str.substring( 0, preffix.length ) === preffix;
}

function MIOStringHasSuffix(str, suffix)
{
    return str.match(suffix+"$")==suffix;
}

