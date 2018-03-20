
export class MIOSize
{
    width = 0;
    height = 0;

    public static Zero():MIOSize
    {
        var s = new MIOSize(0, 0);
        return s;
    }

    constructor(w, h)
    {
        this.width = w;
        this.height = h;
    }

    isEqualTo(size):boolean
    {
        if (this.width == size.width
            && this.height == size.height)
            return true;

        return false;
    }
}