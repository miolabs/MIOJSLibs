

function MIOCoreLoadFromFile_async(path:string, target, completion){

    
}

function MIOCoreIsPhone(){

    var phone = ['iphone','android','blackberry','nokia','opera mini','windows mobile','windows phone','iemobile'];
    for (var i in phone) {
        if (navigator.userAgent.toLowerCase().indexOf(phone[i].toLowerCase()) > 0) {
            return true;
        }
    }    
    return false;
}

function MIOCoreIsPad(){

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
   // if (_mc_force_mobile == true)
   //     return true;

    ///<summary>Detecting whether the browser is a mobile browser or desktop browser</summary>
    ///<returns>A boolean value indicating whether the browser is a mobile browser or not</returns>

    /*if (sessionStorage .desktop) // desktop storage
     return false;
     else if (localStorage.mobile) // mobile storage
     return true;*/

    // alternative
    //var mobile = ['iphone','ipad','android','blackberry','nokia','opera mini','windows mobile','windows phone','iemobile'];
    var mobile = ['iphone','android','blackberry','nokia','opera mini','windows mobile','windows phone','iemobile'];
    for (var i in mobile) if (navigator.userAgent.toLowerCase().indexOf(mobile[i].toLowerCase()) > 0) return true;

    // nothing found.. assume desktop
    return false;
}