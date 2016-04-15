/**
 * Created by godshadow on 11/3/16.
 */

class MIONotification
{
    name = null;
    object = null;

    constructor(name, object)
    {
        this.name = name;
        this.object = object;
    }
}

class MIONotificationCenter
{
    private static _sharedInstance:MIONotificationCenter = new MIONotificationCenter();
    notificationNames = {};

    constructor()
    {
        if (MIONotificationCenter._sharedInstance)
        {
            throw new Error("Error: Instantiation failed: Use defaultCenter() instead of new.");
        }
        MIONotificationCenter._sharedInstance = this;
    }

    public static defaultCenter():MIONotificationCenter
    {
        return MIONotificationCenter._sharedInstance;
    }

    addObserver(obs, name, fn)
    {
        var notes = this.notificationNames[name];
        if (notes == null)
        {
            notes = [];
        }

        var item = {"observer" : obs, "function" : fn};
        notes.push(item);
        this.notificationNames[name] = notes;
    };

    removeObserver(obs, name)
    {
        var notes = this.notificationNames[name];

        if (notes == null)
            return;

        var index = -1;
        for (var count = 0; count < notes.length; count++)
        {
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

    }

    postNotification(name, object)
    {
        var notes = this.notificationNames[name];

        if (notes == null)
            return;

        var n = new MIONotification(name, object);

        for (var count = 0; count < notes.length; count++)
        {
            var item = notes[count];
            var obs = item["observer"];
            var fn = item["function"];

            fn.call(obs, n);
        }
    }
}

