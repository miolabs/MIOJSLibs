/**
 * Created by godshadow on 12/08/16.
 */

class MIOPoint
{
    x = 0;
    y = 0;

    public static Zero()
    {
        var p = new MIOPoint(0, 0);
        return p;
    }

    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }
}

class MIOSize
{
    width = 0;
    height = 0;

    public static Zero()
    {
        var s = new MIOSize(0, 0);
        return s;
    }

    public static Inherit()
    {
        var s = new MIOSize(-1, -1);
        return s;
    }

    constructor(w, h)
    {
        this.width = w;
        this.height = h;
    }

    isEqualTo(size)
    {
        if (this.width == size.width
            && this.height == size.height)
            return true;

        return false;
    }
}

class MIOFrame
{
    origin = null;
    size = null;

    public static Zero()
    {
        var f = new MIOFrame(MIOPoint.Zero(), MIOSize.Zero());
        return f;
    }

    public static frameWithRect(x, y, w, h)
    {
        var p = new MIOPoint(x, y);
        var s = new MIOSize(w, h);
        var f = new MIOFrame(p, s);

        return f;
    }
    constructor(p, s)
    {
        this.origin = p;
        this.size = s;
    }
}