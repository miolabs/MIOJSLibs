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

class MIORect
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

class MIORange 
{
    location = 0;
    length = 0;
    
    constructor(location, length) {
        this.location = location;
        this.length = length;
    }    
}

function MIOMaxRange(range:MIORange):Number{
    return range.location + range.length;
 }

 function MIOEqualRanges(range1:MIORange, range2:MIORange):Boolean {
    return (range1.location == range2.location && range1.length == range2.length);
 }

function MIOLocationInRange(location:Number, range:MIORange){
    if (range == null) return false;
    return (location >= range.location && location < MIOMaxRange(range))? true : false;
 }

function MIOIntersectionRange(range1:MIORange, range2:MIORange):MIORange {

    let max1 = MIOMaxRange(range1);
    let max2 = MIOMaxRange(range2);
    var min, loc;
    var result;
 
    min = (max1 < max2) ? max1: max2;
    loc = (range1.location > range2.location) ? range1.location : range2.location;
 
    if(min < loc) {
        result.location = result.length = 0;
    }
    else {
        result.location = loc;
        result.length = min - loc;
    }
 
    return result;
}

function MIOUnionRange(range1:MIORange, range2:MIORange):MIORange{
    
    let max1 = MIOMaxRange(range1);
    let max2 = MIOMaxRange(range2); 
    
    var max,loc;
    var result;
 
    max = (max1 > max2) ? max1 : max2;
    loc = (range1.location < range2.location) ? range1.location:range2.location;
 
    result.location = loc;
    result.length = max - result.location;
    
    return result;
 }