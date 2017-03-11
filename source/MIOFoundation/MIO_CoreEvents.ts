

/// <reference path="MIO_Core.ts" />
/// <reference path="MIOBundle.ts" />


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
