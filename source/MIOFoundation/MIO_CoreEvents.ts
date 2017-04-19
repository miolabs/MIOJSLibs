

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

var _MIOCoreEventKeysObservers = {};

function MIOCoreRegisterObserverForKeyEvent(eventKey:MIOCoreEventKey, observer, completion)
{
    var item = {"Target" : observer, "Completion" : completion, "Press" : false};
    _MIOCoreEventKeysObservers[eventKey] = item;
}

function MIOCoreUnregisterObserverForKeyEvent(eventKey:MIOCoreEventKey)
{    
    delete _MIOCoreEventKeysObservers[eventKey];
}

window.addEventListener("keydown",
    function(e){
        var keyObserver = _MIOCoreEventKeysObservers[e.keyCode];
        if (keyObserver != null)
        {
            if (keyObserver["Press"] == false)
            {
                keyObserver["Press"] = true;
                var target = keyObserver["Target"];
                var completion = keyObserver["Completion"];
                var handle = completion.call(target);                
                if (handle == true) e.preventDefault();
            }
        }        
    },
false);

window.addEventListener('keyup',
    function(e){
        var keyObserver = _MIOCoreEventKeysObservers[e.keyCode];
        if (keyObserver != null) keyObserver["Press"] = false;
    },
false);

