/**
 * Created by godshadow on 26/3/16.
 */
var MIOObject = (function () {
    function MIOObject() {
        this.keyPaths = {};
    }
    MIOObject.prototype.init = function () { };
    MIOObject.prototype.willChangeValue = function (key) {
        var obs = this.keyPaths[key];
        if (obs != null) {
            for (var count = 0; count < obs.length; count++) {
                var o = obs[count];
                if (typeof o.observeValueForKeyPath === "function")
                    o.observeValueForKeyPath(key, "will", this);
            }
        }
    };
    MIOObject.prototype.didChangeValue = function (key) {
        var obs = this.keyPaths[key];
        if (obs != null) {
            for (var count = 0; count < obs.length; count++) {
                var o = obs[count];
                if (typeof o.observeValueForKeyPath === "function")
                    o.observeValueForKeyPath(key, "did", this);
            }
        }
    };
    MIOObject.prototype.addObserver = function (obs, keypath) {
        var observers = this.keyPaths[keypath];
        if (observers == null) {
            observers = [];
            this.keyPaths[keypath] = observers;
        }
        observers.push(obs);
    };
    MIOObject.prototype.removeObserver = function (obs, keypath) {
        var observers = this.keyPaths[keypath];
        if (observers == null)
            return;
        var index = observers.indexOf(obs);
        observers.splice(index, 1);
    };
    return MIOObject;
})();
//# sourceMappingURL=MIOObject.js.map