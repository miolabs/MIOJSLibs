/**
 * Created by godshadow on 11/3/16.
 */

window.onload = function()
{
    MIOLibOnLoaded(this, function () {

        var app = MIOWebApplication.sharedInstance();

        app.delegate = new AppDelegate();
        app.run();
    });
};

window.onresize = function(e)
{
    if (MIOLibIsLoaded == false)
        return;

    var app = MIOWebApplication.sharedInstance();
    app.forwardResizeEvent.call(app, e);
};

window.onclick = function (e) {

    if (MIOLibIsLoaded == false)
        return;

    var app = MIOWebApplication.sharedInstance();
    app.forwardClickEvent.call(app, e);
};

// output errors to console log
window.onerror = function (e) {
    console.log("window.onerror ::" + JSON.stringify(e));
};

