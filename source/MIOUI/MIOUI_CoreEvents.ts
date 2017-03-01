
/// <reference path="MUIWebApplication.ts" />

window.onresize = function(e)
{
    if (MIOLibIsLoaded == false)
        return;

    var app = MUIWebApplication.sharedInstance();
    app.forwardResizeEvent.call(app, e);
};

window.addEventListener("click", function (e) {

    if (MIOLibIsLoaded == false)
        return;

    var app = MUIWebApplication.sharedInstance();
    app.forwardClickEvent.call(app, e.target, e.clientX, e.clientY);

    //e.preventDefault();

}, false);

window.addEventListener('touchend', function(e){

    if (MIOLibIsLoaded == false)
        return;

    //TODO: Declare changedTouches interface for typescript
    var touch = e.changedTouches[0] // reference first touch point for this event

    var app = MUIWebApplication.sharedInstance();
    app.forwardClickEvent.call(app, e.target, touch.clientX, touch.clientY);

    //e.preventDefault();

}, false);