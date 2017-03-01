

/// <reference path="MIO_Core.ts" />


// Platform events
declare function main(args);

window.onload = function() {

    var args = {};
    MIOCoreDecodeParams(window.location.search, this, function (param, value) {

        args[param] = value;        
    });

    main(args);
};

// output errors to console log
window.onerror = function (e) {
    console.log("window.onerror ::" + JSON.stringify(e));
};
