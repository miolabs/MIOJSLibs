

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
    for (var i in phone) {
        if (navigator.userAgent.toLowerCase().indexOf(phone[i].toLowerCase()) > 0) {
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
    for (var i in pad) {
        if (navigator.userAgent.toLowerCase().indexOf(pad[i].toLowerCase()) > 0) {
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
    for (var i in mobile) if (navigator.userAgent.toLowerCase().indexOf(mobile[i].toLowerCase()) > 0) return true;

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
