/**
 * Created by godshadow on 11/3/16.
 */
var MIONotification = (function () {
    function MIONotification(name, object, userInfo) {
        this.name = null;
        this.object = null;
        this.userInfo = null;
        this.name = name;
        this.object = object;
        this.userInfo = userInfo;
    }
    return MIONotification;
}());
var MIONotificationCenter = (function () {
    function MIONotificationCenter() {
        this.notificationNames = {};
        if (MIONotificationCenter._sharedInstance) {
            throw new Error("Error: Instantiation failed: Use defaultCenter() instead of new.");
        }
        MIONotificationCenter._sharedInstance = this;
    }
    MIONotificationCenter.defaultCenter = function () {
        return MIONotificationCenter._sharedInstance;
    };
    MIONotificationCenter.prototype.addObserver = function (obs, name, fn) {
        var notes = this.notificationNames[name];
        if (notes == null) {
            notes = [];
        }
        var item = { "observer": obs, "function": fn };
        notes.push(item);
        this.notificationNames[name] = notes;
    };
    ;
    MIONotificationCenter.prototype.removeObserver = function (obs, name) {
        var notes = this.notificationNames[name];
        if (notes == null)
            return;
        var index = -1;
        for (var count = 0; count < notes.length; count++) {
            var item = notes[count];
            var obsAux = item["observer"];
            if (obsAux === obs) {
                index = count;
                break;
            }
        }
        if (index > -1) {
            notes.splice(index, 1);
        }
    };
    MIONotificationCenter.prototype.postNotification = function (name, object, userInfo) {
        var notes = this.notificationNames[name];
        if (notes == null)
            return;
        var n = new MIONotification(name, object, userInfo);
        for (var count = 0; count < notes.length; count++) {
            var item = notes[count];
            var obs = item["observer"];
            var fn = item["function"];
            fn.call(obs, n);
        }
    };
    MIONotificationCenter._sharedInstance = new MIONotificationCenter();
    return MIONotificationCenter;
}());
//# sourceMappingURL=MIONotificationCenter.js.map