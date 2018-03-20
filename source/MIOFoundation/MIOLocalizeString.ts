/**
 * Created by godshadow on 21/3/16.
 */

let _MIOLocalizedStrings = null;

export function MIOLocalizeString(key, defaultValue)
{
    const strings =  _MIOLocalizedStrings;
    if (strings == null)
        return defaultValue;

    const value = strings[key];
    if (value == null)
        return defaultValue;

    return value;
}

export function setMIOLocalizedStrings(data) {
    _MIOLocalizedStrings = data
}