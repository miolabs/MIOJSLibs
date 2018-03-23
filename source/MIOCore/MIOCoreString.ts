
export function MIOCoreStringHasPreffix(str, preffix)
{
    return str.substring(0, preffix.length) === preffix;
}

export function MIOCoreStringHasSuffix(str, suffix)
{
    let s = str.substr(str.length - suffix.length);
    return s == suffix;
}

export function MIOCoreStringAppendPathComponent(string:string, path):string
{
    let str = string;

    if (string.charAt(string.length - 1) == "/" && path.charAt(0) == "/"){
        str += path.substr(1);
    }
    else if (string.charAt(string.length - 1) != "/" && path.charAt(0) != "/"){
        str += "/" + path;
    }
    else {
        str += path;
    }

    return str;
}

export function MIOCoreStringLastPathComponent(string:string)
{
    let index = string.lastIndexOf("/");
    let len = string.length - index;
    var str = string.substr(index, len);

    return str;
}

export function MIOCoreStringDeletingLastPathComponent(string:string)
{
    var index = string.lastIndexOf("/");
    var str = string.substr(0, index);

    return str;
}

export function MIOCoreStringStandardizingPath(string)
{
    var array = string.split("/");

    var newArray = []; 
    var index = 0;
    for (let count = 0; count < array.length; count++)
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

    for (let count = 1; count < index; count++)
    {
        str += "/" + newArray[count];
    }

    return str;
}


let _MIOLocalizedStrings = null;

export function MIOLocalizeString(key, defaultValue)
{
    let strings =  _MIOLocalizedStrings;
    if (strings == null)
        return defaultValue;

    let value = strings[key];
    if (value == null)
        return defaultValue;

    return value;
}

export function setMIOLocalizedStrings(data) {
    _MIOLocalizedStrings = data
}

export function getMIOLocalizedStrings() {
    return _MIOLocalizedStrings
}
