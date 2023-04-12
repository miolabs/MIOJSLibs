import 
{
    _MIOCoreDebugOptions,
    MIOCoreDebugOption,    
    MIOCoreClassByName
} from '../../../MIOCore'

import 
{
    MIOCoreEvent,
    MIOCoreEventInput,
    MIOCoreEventType,
    MIOCoreKeyEvent,
    MIOCoreEventMouse,
    MIOCoreEventTouch
} from './MIOCoreEvents'

interface Navigator 
{
    userLanguage;
}

export enum MIOCoreBrowserType
{
    Safari,
    Chrome,
    IE,
    Edge,
    Other
}

export function MIOCoreGetBrowser():MIOCoreBrowserType
{
    var agent = navigator.userAgent.toLowerCase();
    var browserType:MIOCoreBrowserType;    
    if (agent.indexOf("chrome") != -1) browserType = MIOCoreBrowserType.Chrome;
    else if (agent.indexOf("safari") != -1) browserType = MIOCoreBrowserType.Safari;    
    else browserType = MIOCoreBrowserType.Other;

    return browserType;
}

export function MIOCoreGetBrowserLocale(){
    // navigator.languages:    Chrome & FF
    // navigator.language:     Safari & Others
    // navigator.userLanguage: IE & Others
    return navigator.languages || navigator.language || navigator['userLanguage'];
}

export function MIOCoreGetBrowserLanguage(){
    let locale = MIOCoreGetBrowserLocale();
    if (typeof(locale) == "string") return locale.substring(0, 2);
    else {
        let l = locale[0];
        return l.substring(0, 2);
    }
}

/*
export function MIOGetDefaultLanguage()
{
    var string = window.location.search;
    console.log(string);
}
*/

export function MIOCoreGetQueryOptions(){

    let searchString = window.location.search;
    if (searchString.length == 0) return [];

    if (searchString.length > 0 && searchString[0] == "?") searchString = searchString.substr(1);
            
    let params = searchString.split("&");
    return params;
}


export function MIOCoreGetMainBundleURLString():string{
    return MIOCoreGetMainURLString();
}

export function MIOCoreGetMainURLString(): string {
    
    let url_string = window.location.protocol ? window.location.protocol + "//" : "";
    url_string += window.location.host;    
    if (window.location.pathname.substr(-1) == "/") {
        url_string += window.location.pathname;
    }
    else {        
        url_string += window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    }
        
    return url_string;
}

export function MIOCoreDeviceTypeString(){
    return navigator.userAgent.toLowerCase();
}

export function MIOCoreDeviceOSString(){
    let type = MIOCoreDeviceTypeString();
    if (type == 'iphone' || type == 'ipad') return "ios";
    
    return type;
}

export function MIOCoreIsPhone(){    

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

export function MIOCoreIsPad(){

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

export function MIOCoreIsMobile()
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

export function MIOCoreLoadScriptURL(url)
{
    // Adding the script tag to the head as suggested before
    let head = document.getElementsByTagName('head')[0];
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.async = true;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
//    script.onreadystatechange = callback;
//    script.onload = callback;

    // Fire the loading
    head.appendChild(script);

    return script;
}

export function MIOCoreLoadHeadContent(content:any, type:string) {
    // Adding the script tag to the head as suggested before
    let head = document.getElementsByTagName('head')[0];
    let script = document.createElement(type);
    script.innerHTML = content;

    // Fire the loading
    head.appendChild(script);

    return script;

}

export function MIOCoreRemoveScript(script:any) {    
    script.parentNode.removeChild(script);
}


var _stylesCache = {};

function _MIOCoreLoadStyle_test1(url, target?, completion?)
{
    // Prevent loading the same css files
    if (_stylesCache[url] != null) return;
    _stylesCache[url] = true;

    var ss = document.createElement("link");
    ss.type = "text/css";
    ss.rel = "stylesheet";
    ss.href = url;
    document.getElementsByTagName("head")[0].appendChild(ss);
}

interface StyleSheet {
    cssRules;
}

// function _MIOCoreLoadStyle_test2(url, target?, completion?)
// {
//      // Prevent loading the same css files
//     if (_stylesCache[url] != null) return;
//     _stylesCache[url] = true;

//     var style = document.createElement('style');
//     style.textContent = '@import "' + url + '"';
 
//     var fi = setInterval(function() {
//     try {
//         style.sheet['cssRules']; // <--- MAGIC: only populated when file is loaded
//         clearInterval(fi);
//         if (target != null && completion != null)
//             completion.call(target);
        
//     } catch (e){}
//     }, 10);  
    
//     var head = document.getElementsByTagName("head")[0];
//     head.appendChild(style);
// }

export function MIOCoreLoadStyle(url, media, target?, completion?)
{
    // Prevent loading the same css files
    if (_stylesCache[url] != null) 
    {
        if (target != null && completion != null)
            completion.call(target);
        return;
    }
    _stylesCache[url] = true;

    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = url;
    if (media != null) link.media = media;

    var head = document.getElementsByTagName('head')[0];
    head.appendChild(link);

    if (target == null && completion == null) return;

    // Creating the callback trying to load an img which is gona fail, calling the callback. 
    // WTF?? Seriosly I have to do this for get a load callback??
    var img = document.createElement('img');
    img.onerror = function(){
        completion.call(target);
    }
    img.src = url;
}

export function MIOClassFromString(className)
{
    let classObject = window[className];
    if (classObject == null) classObject = MIOCoreClassByName(className);

    if (classObject == null) throw new Error("MIOClassFromString: class '" + className + "' didn't register.");

    let newClass = new classObject();
    return newClass;
}

// Declare main funciton so we can call after intizalization

declare function main(args);

window.onload = function(e) {
    
    let url = MIOCoreGetMainBundleURLString();
    console.log("Main URL: " + url);
    let args = MIOCoreGetQueryOptions();
    args.unshift(url);
    
    main(args);
};

// output errors to console log
window.onerror = function (e) {
    console.log("window.onerror ::" + JSON.stringify(e));
};

var _miocore_events_event_observers = {};

export function MIOCoreEventRegisterObserverForType(eventType:MIOCoreEventType, observer, completion)
{
    console.log("MIOCoreEvent: Register for event type: " + eventType);
    let item = {"Target" : observer, "Completion" : completion};

    let array = _miocore_events_event_observers[eventType];
    if (array == null)
    {
        array = [];
        _miocore_events_event_observers[eventType] = array;
    }

    array.push(item);
}

export function MIOCoreEventUnregisterObserverForType(eventType:MIOCoreEventType, observer)
{    
    console.log("MIOCoreEvent: Unregister for event type: " + eventType);
    let obs = _miocore_events_event_observers[eventType];
    if (obs == null) return;

    let index = -1;
    for (let count = 0; count < obs.length; count++){
    
        let item = obs[count];
        let target = item["Target"];        
        if (target === observer) {
            index = count;
            break;
        }
    }

    if (index > -1) {
        obs.splice(index, 1);
    }
}

function _MIOCoreEventSendToObservers(obs, event:MIOCoreEvent){

    if (obs != null)
    {
        for (let index = 0; index < obs.length; index++) {
            
            let o = obs[index];
            let target = o["Target"];
            let completion = o["Completion"];

            completion.call(target, event);
        }
    }        
}

/* 
    EVENTS
*/

// Keyboard events

window.addEventListener("keydown", function(e){
        
        // Create event
        let event = new MIOCoreKeyEvent();
        event.initWithKeyCode(MIOCoreEventType.KeyDown, e.keyCode, e);

        let observers = _miocore_events_event_observers[MIOCoreEventType.KeyDown];
        _MIOCoreEventSendToObservers(observers, event);
    },
false);

window.addEventListener('keyup', function(e){
        
        // Create event
        let event = new MIOCoreKeyEvent();
        event.initWithKeyCode(MIOCoreEventType.KeyUp, e.keyCode, e);

        let observers = _miocore_events_event_observers[MIOCoreEventType.KeyUp];
        _MIOCoreEventSendToObservers(observers, event);
    },
false);

// Mouse and touch events

window.addEventListener('mousedown', function(e){
        
        // Create event
        let event = new MIOCoreKeyEvent();
        event.initWithType(MIOCoreEventType.MouseDown, e);

        let observers = _miocore_events_event_observers[MIOCoreEventType.MouseDown];
        _MIOCoreEventSendToObservers(observers, event);        
    },
false);

window.addEventListener('mouseup', function(e){
        
        // Create event
        var event = new MIOCoreEventMouse();
        event.initWithType(MIOCoreEventType.MouseUp, e);

        let observers_mouseup = _miocore_events_event_observers[MIOCoreEventType.MouseUp];
        _MIOCoreEventSendToObservers(observers_mouseup, event);

        // Send click event
        let observers_click = _miocore_events_event_observers[MIOCoreEventType.Click];
        _MIOCoreEventSendToObservers(observers_click, event);
    },
false);

window.addEventListener('touchend', function(e:TouchEvent){
    
        // Create event
        let event = new MIOCoreEventTouch();
        event.initWithType(MIOCoreEventType.TouchEnd, e);

        let observers_touchend = _miocore_events_event_observers[MIOCoreEventType.TouchEnd];
        _MIOCoreEventSendToObservers(observers_touchend, event);

        // Send click event
        let observers_click = _miocore_events_event_observers[MIOCoreEventType.Click];
        _MIOCoreEventSendToObservers(observers_click, event);

}, false);

// UI events
window.addEventListener("resize", function(e) {
        
        let event = new MIOCoreEvent();
        event.initWithType(MIOCoreEventType.Resize, e);

        let observers = _miocore_events_event_observers[MIOCoreEventType.Resize];
        _MIOCoreEventSendToObservers(observers, event);

}, false);


