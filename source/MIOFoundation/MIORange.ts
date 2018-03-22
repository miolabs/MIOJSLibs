export class MIORange 
{
    location = 0;
    length = 0;
    
    constructor(location, length) {
        this.location = location;
        this.length = length;
    }    
}

export function MIOMaxRange(range:MIORange):number{
    return range.location + range.length;
 }

export function MIOEqualRanges(range1:MIORange, range2:MIORange):boolean {
    return (range1.location == range2.location && range1.length == range2.length);
 }

export function MIOLocationInRange(location:number, range:MIORange){
    if (range == null) return false;
    return (location >= range.location && location < MIOMaxRange(range))? true : false;
 }

export function MIOIntersectionRange(range1:MIORange, range2:MIORange):MIORange {

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

export function MIOUnionRange(range1:MIORange, range2:MIORange):MIORange{
    
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