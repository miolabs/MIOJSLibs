/**
 * Created by godshadow on 21/3/16.
 */
/// <reference path="MIOCore.ts" />
function MIOLocalizeString(key, defaultValue) {
    var strings = MIOLocalizedStrings;
    if (strings == null)
        return defaultValue;
    var value = strings[key];
    if (value == null)
        return defaultValue;
    return value;
}
//# sourceMappingURL=MIOString.js.map