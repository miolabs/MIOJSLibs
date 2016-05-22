/**
 * Created by godshadow on 11/3/16.
 */

function MIOCoreDownloadFile(target, url, fn)
{
    MIONotificationCenter.defaultCenter().postNotification("MIODownloadingCoreFile", null);

    var conn =  new MIOURLConnection();
    conn.initWithRequestBlock(new MIOURLRequest(url), this, function(error, data){

        fn.call(target, data);
        MIONotificationCenter.defaultCenter().postNotification("MIODownloadedCoreFile", null);
    });

}

function MIOCCoreLoadTextFile(href)
{
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", href, false);
    xmlhttp.send();

    var response = xmlhttp.responseText;
    return response;
}

function MIOCoreLoadScript(url)
{
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
//    script.onreadystatechange = callback;
//    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}

function MIOCoreLoadStyle(url)
{
    var ss = document.createElement("link");
    ss.type = "text/css";
    ss.rel = "stylesheet";
    ss.href = url;
    document.getElementsByTagName("head")[0].appendChild(ss);
}

function MIOCoreIsMobile()
{
    ///<summary>Detecting whether the browser is a mobile browser or desktop browser</summary>
    ///<returns>A boolean value indicating whether the browser is a mobile browser or not</returns>

    /*if (sessionStorage .desktop) // desktop storage
        return false;
    else if (localStorage.mobile) // mobile storage
        return true;*/

    // alternative
    var mobile = ['iphone','ipad','android','blackberry','nokia','opera mini','windows mobile','windows phone','iemobile'];
    for (var i in mobile) if (navigator.userAgent.toLowerCase().indexOf(mobile[i].toLowerCase()) > 0) return true;

    // nothing found.. assume desktop
    return false;
}

function MIOGetDefaultLanguage()
{
    var string = window.location.search;
    console.log(string);
}

interface Window {
    prototype;
}

function MIOClassFromString(className)
{
    //instance creation here
    var object = Object.create(window[className].prototype);
    object.constructor.apply(object);

    return object;
}
