/**
 * Created by godshadow on 28/09/2016.
 */

/// <reference path="MIOObject.ts" />

class MIOSortDescriptor extends MIOObject
{
    key = null;
    ascending = false;

    public static sortDescriptorWithKey(key, ascending)
    {
        var sd = new MIOSortDescriptor();
        sd.initWithKey(key, ascending);
        return sd;
    }

    initWithKey(key, ascending)
    {
        this.key = key;
        this.ascending = ascending;
    }
}