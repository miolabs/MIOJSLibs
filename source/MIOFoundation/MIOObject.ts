/**
 * Created by godshadow on 26/3/16.
 */


class MIOObject
{
    keyPaths = {};

    init() {}

    willChangeValue(key)
    {
        var obs = this.keyPaths[key];
        if (obs != null) {
            for(var count = 0; count < obs.length; count++) {
                var o = obs[count];
                if (typeof o.observeValueForKeyPath === "function")
                    o.observeValueForKeyPath(key, "will", this);
            }
        }
    }

    didChangeValue(key)
    {
        var obs = this.keyPaths[key];
        if (obs != null) {
            for(var count = 0; count < obs.length; count++) {
                var o = obs[count];
                if (typeof o.observeValueForKeyPath === "function")
                    o.observeValueForKeyPath(key, "did", this);
            }
        }
    }

    addObserver(obs, keypath)
    {
        var observers = this.keyPaths[keypath];
        if (observers == null)
        {
            observers = [];
            this.keyPaths[keypath] = observers;
        }

        observers.push(obs);
    }

    removeObserver(obs, keypath)
    {
        var observers = this.keyPaths[keypath];
        if (observers == null)
            return;

        var index = observers.indexOf(obs);
        observers.splice(index, 1);
    }
}