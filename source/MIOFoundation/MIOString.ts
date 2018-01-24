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

interface String {
    stringByAppendingPathComponent(path:string):string;
    
    lastPathComponent():string;    
    stringByDeletingLastPathComponent():string;
}

String.prototype.lastPathComponent = function():string{
    return MIOStringLastPathComponent(this);
}

String.prototype.stringByAppendingPathComponent = function(path:string):string{
    return MIOStringAppendPathComponent(this, path);
}
String.prototype.stringByDeletingLastPathComponent = function():string{
    return MIOStringDeletingLastPathComponent(this);
}

function MIOStringHasPreffix(str, preffix)
{
    return str.substring( 0, preffix.length ) === preffix;
}

function MIOStringHasSuffix(str, suffix)
{
    return str.match(suffix+"$")==suffix;
}

function MIOStringAppendPathComponent(string:string, path):string
{
    var str = string;
    
    if (string.charAt(string.length - 2) != "/")
        str += "/";

    if (path.charAt(0) != "/")
        str += path;
    else
        str += path.substr(1);

    return str;
}

function MIOStringLastPathComponent(string:string)
{
    let index = string.lastIndexOf("/");
    let len = string.length - index;
    var str = string.substr(index, len);

    return str;
}

function MIOStringDeletingLastPathComponent(string:string)
{
    var index = string.lastIndexOf("/");
    var str = string.substr(0, index);

    return str;
}

function MIOStringStandardizingPath(string)
{
    var array = string.split("/");

    var newArray = []; 
    var index = 0;
    for (var count = 0; count < array.length; count++)
    {
        var component:string = array[count];
        if (component.substr(0,2) == "..")
            index--;
        else 
        {
            newArray[index] = component;
            index++;
        }                
    }

    var str = "";
    if (index > 0)
        str = newArray[0];

    for (var count = 1; count < index; count++)
    {
        str += "/" + newArray[count];
    }

    return str;
}
