/**
 * Created by godshadow on 21/3/16.
 */

/// <reference path="MIOCore.ts" />

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

// String.prototype.endsWith = function(suffix) {
//     return this.indexOf(suffix, this.length - suffix.length) !== -1;
// };

function MIOStringHasSuffix(str, suffix)
{
    return str.match(suffix+"$")==suffix;
}

