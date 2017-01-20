/**
 * Created by godshadow on 11/3/16.
 */

MIOLibInit(main, MIOLibInitType.Debug);

// Model files

// App files
MIOLibDownloadFile("AppDelegate");

function main(args)
{
    var app = MIOWebApplication.sharedInstance();

    app.delegate = new AppDelegate();
    app.run();
}
