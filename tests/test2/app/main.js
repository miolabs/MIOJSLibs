
// Main entry point

function main(args)
{
    var app = MUIWebApplication.sharedInstance();

    app.delegate = new AppDelegate();
    app.run();
}