/// <reference path="MIOObject.ts" />

class MIONull extends MIOObject
{            
    static nullValue():MIONull {
        let n = new MIONull();
        return n;
    }
}