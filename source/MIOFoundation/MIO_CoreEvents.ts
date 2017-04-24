

/// <reference path="MIO_Core.ts" />
/// <reference path="MIOBundle.ts" />
/// <reference path="MIO_CoreEventTypes.ts" />


// Declare main funciton so we can call after intizalization

declare function main(args);


window.onload = function() {
    
    var mb = MIOBundle.mainBundle();
    console.log("Main URL: " + mb.url.absoluteString);
    var args = mb.url.params;

    main(args);
};

// output errors to console log
window.onerror = function (e) {
    console.log("window.onerror ::" + JSON.stringify(e));
};

var _miocore_events_event_observers = {};

function MIOCoreEventRegisterObserverForType(eventType:MIOCoreEventType, observer, completion)
{
    var item = {"Target" : observer, "Completion" : completion};

    var array = _miocore_events_event_observers[eventType];
    if (array == null)
    {
        array = [];
        _miocore_events_event_observers[eventType] = array;
    }

    array.push(item);
}

function MIOCoreEventUnregisterObserverForType(eventType:MIOCoreEventType, observer)
{    
    var obs = _miocore_events_event_observers[eventType];
    if (obs == null) return;

    var index = -1;
    for (var count = 0; count < obs.length; count++){
    
        var item = obs[count];
        var target = item["Target"];        
        if (target === observer) {
            index = count;
            break;
        }
    }

    if (index > -1) obs.splice(index, 1);
}

function _MIOCoreEventSendToObservers(obs, event:MIOCoreEvent){

    if (obs != null)
    {
        for (var index = 0; index < obs.length; index++) {
            
            var o = obs[index];
            var target = o["Target"];
            var completion = o["Completion"];

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
        var event = new MIOCoreKeyEvent();
        event.initWithKeyCode(MIOCoreEventType.KeyDown, e.keyCode, e);

        var observers = _miocore_events_event_observers[MIOCoreEventType.KeyDown];
        _MIOCoreEventSendToObservers(observers, event);
    },
false);

window.addEventListener('keyup', function(e){
        
        // Create event
        var event = new MIOCoreKeyEvent();
        event.initWithKeyCode(MIOCoreEventType.KeyUp, e.keyCode, e);

        var observers = _miocore_events_event_observers[MIOCoreEventType.KeyUp];
        _MIOCoreEventSendToObservers(observers, event);
    },
false);

// Mouse and touch events

window.addEventListener('mousedown', function(e){
        
        // Create event
        var event = new MIOCoreKeyEvent();
        event.initWithType(MIOCoreEventType.MouseDown, e);

        var observers = _miocore_events_event_observers[MIOCoreEventType.MouseDown];
        _MIOCoreEventSendToObservers(observers, event);        
    },
false);

window.addEventListener('mouseup', function(e){
        
        // Create event
        var event = new MIOCoreEventMouse();
        event.initWithType(MIOCoreEventType.MouseUp, e);

        var observers = _miocore_events_event_observers[MIOCoreEventType.MouseUp];
        _MIOCoreEventSendToObservers(observers, event);

        // Send click event
        var observers = _miocore_events_event_observers[MIOCoreEventType.Click];
        _MIOCoreEventSendToObservers(observers, event);
    },
false);

window.addEventListener('touchend', function(e){
    
        // Create event
        var event = new MIOCoreEventTouch();
        event.initWithType(MIOCoreEventType.TouchEnd, e);

        var observers = _miocore_events_event_observers[MIOCoreEventType.TouchEnd];
        _MIOCoreEventSendToObservers(observers, event);

        // Send click event
        var observers = _miocore_events_event_observers[MIOCoreEventType.Click];
        _MIOCoreEventSendToObservers(observers, event);

}, false);

// UI events
window.addEventListener("resize", function(e) {
        
        var event = new MIOCoreEvent();
        event.initWithType(MIOCoreEventType.Resize, e);

        var observers = _miocore_events_event_observers[MIOCoreEventType.Resize];
        _MIOCoreEventSendToObservers(observers, event);

}, false);

