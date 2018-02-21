/**
 * Created by godshadow on 21/3/16.
 */

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

interface String {
    stringByAppendingPathComponent(path:string):string;
    
    lastPathComponent():string;    
    stringByDeletingLastPathComponent():string;

    hasPreffix(preffix:string):boolean;
    hasSuffix(suffix:string):boolean;
}

String.prototype.lastPathComponent = function():string{
    return MIOCoreStringLastPathComponent(this);
}

String.prototype.stringByAppendingPathComponent = function(path:string):string{
    return MIOCoreStringAppendPathComponent(this, path);
}

String.prototype.stringByDeletingLastPathComponent = function():string{
    return MIOCoreStringDeletingLastPathComponent(this);
}

String.prototype.hasPreffix = function(preffix:string):boolean{
    return MIOCoreStringHasPreffix(this, preffix);
}

String.prototype.hasSuffix = function(suffix:string):boolean{
    return MIOCoreStringHasSuffix(this, suffix);
}