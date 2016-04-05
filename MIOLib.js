/**
 * Created by godshadow on 22/3/16.
 */

function MIOCoreLoadScript(url)
{
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
//    script.onreadystatechange = callback;
//    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}

// Load Classes into head script
MIOCoreLoadScript("src/miolib/MIONotificationCenter.js");
MIOCoreLoadScript("src/miolib/MIODate.js");
MIOCoreLoadScript("src/miolib/MIOUUID.js");
MIOCoreLoadScript("src/miolib/MIOWebApplication.js");
MIOCoreLoadScript("src/miolib/MIOURLConnection.js");

MIOCoreLoadScript("src/miolib/MIOView.js");
MIOCoreLoadScript("src/miolib/MIOWindow.js");
MIOCoreLoadScript("src/miolib/MIOLabel.js");
MIOCoreLoadScript("src/miolib/MIOCalendarView.js");
MIOCoreLoadScript("src/miolib/MIOImageView.js");

MIOCoreLoadScript("src/miolib/MIOControl.js");
MIOCoreLoadScript("src/miolib/MIOButton.js");
MIOCoreLoadScript("src/miolib/MIOPopUpButton.js");
MIOCoreLoadScript("src/miolib/MIOStepControlButton.js");
MIOCoreLoadScript("src/miolib/MIOStepControl.js");
MIOCoreLoadScript("src/miolib/MIOCheckButton.js");
MIOCoreLoadScript("src/miolib/MIOTextField.js");
MIOCoreLoadScript("src/miolib/MIOTextArea.js");

MIOCoreLoadScript("src/miolib/MIOViewController.js");
MIOCoreLoadScript("src/miolib/MIOPageController.js");
