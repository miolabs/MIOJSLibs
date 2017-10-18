/**
 * Created by godshadow on 26/3/16.
 */


class MIOObject
{
    className = "MIOObject";
    keyPaths = {};

    init() {}

    private _notifyValueChange(key:string, type:string) {
        
        let observers = this.keyPaths[key];
        if (observers == null) return;

        // copy the array so we can iterating safetly
        var obs = [];
        for(var count = 0; count < observers.length; count++) {
            let item = observers[count];
            obs.push(item);
        }        

        for(var count = 0; count < obs.length; count++) {
            let item = obs[count];
            let o = item["OBS"];            
            if (typeof o.observeValueForKeyPath === "function") {
                let keyPath = item["KP"] != null ? item["KP"]: key;
                let ctx = item["CTX"];            
                o.observeValueForKeyPath.call(o, keyPath, type, this, ctx);
            }
        }
    }

    willChangeValue(key:string) {
        this._notifyValueChange(key, "will");
    }

    didChangeValue(key:string){
        this._notifyValueChange(key, "did");
    }

    private _addObserver(obs, key:string, context, keyPath?:string) {

        var observers = this.keyPaths[key];
        if (observers == null)
        {
            observers = [];
            this.keyPaths[key] = observers;
        }

        let item = {"OBS" : obs};
        if (context != null) item["CTX"] = context;
        if (keyPath != null) item["KP"] = keyPath;
        observers.push(item);
    }

    private _keyFromKeypath(keypath:string) {

        let index = keypath.indexOf('.');
        if (index == -1) {
            return [keypath, null];
        }

        let key = keypath.substring(0, index);
        let offset = keypath.substring(index + 1);

        return [key, offset];
    }

    addObserver(obs, keypath:string, context?)
    {
        let [key, offset] = this._keyFromKeypath(keypath);
        
        if (offset == null) {
            this._addObserver(obs, key, context);
        }
        else {
            var obj = this;
            var exit = false;
            while (exit == false) {                
                if (offset == null) {
                    obj._addObserver(obs, key, context, keypath);
                    exit = true;
                }
                else  {
                    obj = this.valueForKey(key);
                    [key, offset] = this._keyFromKeypath(offset);
                }

                if (obj == null) throw ("ERROR: Registering observer to null object");
            }
        }
    }

    removeObserver(obs, keypath:string)
    {
        var observers = this.keyPaths[keypath];
        if (observers == null)
            return;

        var index = observers.indexOf(obs);
        observers.splice(index, 1);
    }

    setValueForKey(key, value) {
    
        this.willChangeValue(key);
        this[key] = value;
        this.didChangeValue(value);
    }

    valueForKey(key) {
        return this[key];
    }

    valueForKeyPath(keyPath:string) {

        let [key, offset] = this._keyFromKeypath(keyPath);
        
        var value = null;
        var obj = this;
        var exit = false;
        while (exit == false) {                
            if (offset == null) {
                value = obj.valueForKey(key);
                exit = true;
            }
            else  {
                obj = obj.valueForKey(key);
                [key, offset] = this._keyFromKeypath(offset);
                if (obj == null) exit = true;
            }            
        }

        return value;
    }
        

    copy() {
        var obj = MIOClassFromString(this.className);
        obj.init();
        
        return obj;
    }
}