/// <reference path="MIOObject.ts" />

class MIONull extends MIOObject
{            
    static nullValue():MIONull {
        var n = new MIONull();
        n.init();
        return n;
    }
}