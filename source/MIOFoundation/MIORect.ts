import { MIOPoint } from "./MIOPoint";
import { MIOSize } from "./MIOSize";

export class MIORect
{
    origin:MIOPoint = null;
    size:MIOSize = null;

    public static Zero()
    {
        var f = new MIORect(MIOPoint.Zero(), MIOSize.Zero());
        return f;
    }

    public static rectWithValues(x, y, w, h)
    {
        var p = new MIOPoint(x, y);
        var s = new MIOSize(w, h);
        var f = new MIORect(p, s);

        return f;
    }
    constructor(p, s)
    {
        this.origin = p;
        this.size = s;
    }
}

function MIORectMaxY(rect:MIORect) {
    return rect.origin.y;
}

function MIORectMinY(rect:MIORect) {
    return rect.origin.y + rect.size.height;
}
