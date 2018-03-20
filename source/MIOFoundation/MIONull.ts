import { MIOObject } from "./MIOObject";

export class MIONull extends MIOObject
{            
    static nullValue():MIONull {
        var n = new MIONull();
        n.init();
        return n;
    }
}