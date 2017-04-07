
/// <reference path="MUIWebApplication.ts" />

window.onresize = function(e)
{
    if (MIOLibIsLoaded == false)
        return;

    var app = MUIWebApplication.sharedInstance();
    app.forwardResizeEvent.call(app, e);
};

window.addEventListener("click", function (e) {

    var app = MUIWebApplication.sharedInstance();
    app.forwardClickEvent.call(app, e.target, e.clientX, e.clientY);

    //e.preventDefault();

}, false);

// Declare changedTouches interface for typescript
interface Event {
    touches:TouchList;
    targetTouches:TouchList;
    changedTouches:TouchList;
};

window.addEventListener('touchend', function(e){
    
    var touch = e.changedTouches[0] // reference first touch point for this event

    var app = MUIWebApplication.sharedInstance();
    app.forwardClickEvent.call(app, e.target, touch.clientX, touch.clientY);

    //e.preventDefault();

}, false);

var keys = {};
window.addEventListener("keydown",
    function(e){
        keys[e.keyCode] = true;
        switch(e.keyCode){
            case 37: case 39: case 38:  case 40: // Arrow keys
            case 32: e.preventDefault(); break; // Space
            default: break; // do not block other keys
        }
    },
false);
window.addEventListener('keyup',
    function(e){
        keys[e.keyCode] = false;
    },
false);