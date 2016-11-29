/**
 * Created by godshadow on 11/3/16.
 */

MIOLibCheckParams();

// MIOLib files
MIOLibDownloadFile("miolib/MIOCore");
MIOLibDownloadFile("miolib/MIOCoreTypes");
MIOLibDownloadFile("miolib/MIOObject");
MIOLibDownloadFile("miolib/MIOUserDefaults");
MIOLibDownloadFile("miolib/MIOString");
MIOLibDownloadFile("miolib/MIODate");
MIOLibDownloadFile("miolib/Date_MIO");
MIOLibDownloadFile("miolib/MIOUUID");
MIOLibDownloadFile("miolib/MIONotificationCenter");
MIOLibDownloadFile("miolib/MIOWebApplication");
MIOLibDownloadFile("miolib/MIOURLConnection");
MIOLibDownloadFile("miolib/MIOBundle");
MIOLibDownloadFile("miolib/MIOPredicate");
MIOLibDownloadFile("miolib/MIOSortDescriptor");
MIOLibDownloadFile("miolib/MIOManagedObjectContext");
MIOLibDownloadFile("miolib/MIOFetchedResultsController");
MIOLibDownloadFile("miolib/MIOView");
MIOLibDownloadFile("miolib/MIOScrollView");
MIOLibDownloadFile("miolib/MIOWindow");
MIOLibDownloadFile("miolib/MIOLabel");
MIOLibDownloadFile("miolib/MIOTableView");
MIOLibDownloadFile("miolib/MIOCollectionView");
MIOLibDownloadFile("miolib/MIOCalendarView");
MIOLibDownloadFile("miolib/MIOImageView");
MIOLibDownloadFile("miolib/MIOMenu");
MIOLibDownloadFile("miolib/MIOActivityIndicator");
MIOLibDownloadFile("miolib/MIOWebView");
MIOLibDownloadFile("miolib/MIOControl");
MIOLibDownloadFile("miolib/MIOButton");
MIOLibDownloadFile("miolib/MIOComboBox");
MIOLibDownloadFile("miolib/MIOPopUpButton");
MIOLibDownloadFile("miolib/MIOCheckButton");
MIOLibDownloadFile("miolib/MIOSegmentedControl");
MIOLibDownloadFile("miolib/MIOTextField");
MIOLibDownloadFile("miolib/MIOTextArea");
MIOLibDownloadFile("miolib/MIOTabBar");
MIOLibDownloadFile("miolib/MIOPageControl");
MIOLibDownloadFile("miolib/MIOViewController");
MIOLibDownloadFile("miolib/MIOViewController_Animation");
MIOLibDownloadFile("miolib/MIOViewController_PopoverPresentationController");
MIOLibDownloadFile("miolib/MIONavigationController");
MIOLibDownloadFile("miolib/MIOPageController");
MIOLibDownloadFile("miolib/MIOSplitViewController");
MIOLibDownloadFile("miolib/webworkers/MIOHTMLParser");

// Model files

// App files
MIOLibDownloadFile("AppDelegate");


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

