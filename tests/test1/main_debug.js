/**
 * Created by godshadow on 11/3/16.
 */

MIOLibInit(main, MIOLibInitType.Debug);

// Model files

// App files
MIOLibDownloadFile("AppDelegate");

function main(args)
{
    let app = MIOWebApplication.sharedInstance();

    app.delegate = new AppDelegate();
    app.run();
}
