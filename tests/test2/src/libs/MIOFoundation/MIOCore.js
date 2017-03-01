function MIOCoreDecodeParams(string, target, completion) {
    var param = "";
    var value = "";
    var isParam = false;
    for (var index = 0; index < string.length; index++) {
        var ch = string.charAt(index);
        if (ch == "?") {
            isParam = true;
        }
        else if (ch == "&") {
            // new param
            MIOCoreEvaluateParam(param, value, target, completion);
            isParam = true;
            param = "";
            value = "";
        }
        else if (ch == "=") {
            isParam = false;
        }
        else {
            if (isParam == true)
                param += ch;
            else
                value += ch;
        }
    }
    MIOCoreEvaluateParam(param, value, target, completion);
}
function MIOCoreEvaluateParam(param, value, target, completion) {
    if (target != null && completion != null)
        completion.call(target, param, value);
}
window.onload = function () {
    var args = {};
    MIOCoreDecodeParams(window.location.search, this, function (param, value) {
        args[param] = value;
    });
    main(args);
};
