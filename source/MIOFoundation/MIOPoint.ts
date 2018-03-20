export class MIOPoint
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
