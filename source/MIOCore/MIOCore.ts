

function MIOCoreLoadFromFile_async(path:string, target, completion){

}

enum MIOCoreDebugOption {
    Phone,
    Pad,
    Mobile,
    Desktop
}

var _MIOCoreDebugOptions = {};

function MIOCoreSetDebugOption(option, value){
    _MIOCoreDebugOptions[option] = value;    

    switch(option) {
        case MIOCoreDebugOption.Phone:
        case MIOCoreDebugOption.Pad:
            _MIOCoreDebugOptions[MIOCoreDebugOption.Mobile] = value;
            break;
    }
}

function MIOCoreIsPhone(){

    // Debug
    var value = _MIOCoreDebugOptions[MIOCoreDebugOption.Phone];
    if (value != null) return value;

    var phone = ['iphone','android','blackberry','nokia','opera mini','windows mobile','windows phone','iemobile'];
    for (var index = 0; index < phone.length; index++) {
        if (navigator.userAgent.toLowerCase().indexOf(phone[index].toLowerCase()) > 0) {
            return true;
        }
    }    
    return false;
}

function MIOCoreIsPad(){

    // Debug
    var value = _MIOCoreDebugOptions[MIOCoreDebugOption.Pad];
    if (value != null) return value;

    var pad = ['ipad'];
    for (var index = 0; index < pad.length; index++) {
        if (navigator.userAgent.toLowerCase().indexOf(pad[index].toLowerCase()) > 0) {
            return true;
        }
    }
    
    return false;    
}

function MIOCoreIsMobile()
{
    // Debug
    var value = _MIOCoreDebugOptions[MIOCoreDebugOption.Mobile];
    if (value != null) return value;    

    //var mobile = ['iphone','ipad','android','blackberry','nokia','opera mini','windows mobile','windows phone','iemobile'];
    var mobile = ['iphone','android','blackberry','nokia','opera mini','windows mobile','windows phone','iemobile'];
    for (var index = 0; index < mobile.length; index++) {
        if (navigator.userAgent.toLowerCase().indexOf(mobile[index].toLowerCase()) > 0) return true;
    }

    // nothing found.. assume desktop
    return false;
}

enum MIOCoreAppType
{
    Web,
    iOS,
    macOS,
    Android,
    WindowsMobile,
    Windows,
    Linux
}

var _miocore_app_type:MIOCoreAppType;

function MIOCoreSetAppType(appType:MIOCoreAppType)
{
    _miocore_app_type = appType;
}

function MIOCoreGetAppType():MIOCoreAppType
{
    return _miocore_app_type;
}

function MIOCoreGetMainBundleURL()
{    
    var url = null;

    if (MIOCoreGetAppType() == MIOCoreAppType.Web)
    {
        url = new MIOURL();    
        url.initWithURLString(window.location.href);
    }
    
    return url;
}

let _miocore_languages = null;
function MIOCoreAddLanguage(lang, url){
    if (_miocore_languages == null) _miocore_languages = {};
    _miocore_languages[lang] = url;
}

function MIOCoreGetLanguages(){
    return _miocore_languages;
}

interface Navigator {
    userLanguage;
}

function MIOCoreGetBrowserLocale(){
    // navigator.languages:    Chrome & FF
    // navigator.language:     Safari & Others
    // navigator.userLanguage: IE & Others
    return navigator.languages || navigator.language || navigator.userLanguage;
}

function MIOCoreGetBrowserLanguage(){
    let locale = MIOCoreGetBrowserLocale();
    if (typeof(locale) == "string") return locale.substring(0, 2);
    else {
        let l = locale[0];
        return l.substring(0, 2);
    }
}
