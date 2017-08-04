
// Main entry point

MIOCoreSetAppType(MIOCoreAppType.Web);

function main(args)
{    
    var app = MUIWebApplication.sharedInstance();

    app.delegate = new AppDelegate();
    app.run();
}