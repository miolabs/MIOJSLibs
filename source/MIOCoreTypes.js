/**
 * Created by godshadow on 12/08/16.
 */
var MIOPoint = (function () {
    function MIOPoint(x, y) {
        this.x = 0;
        this.y = 0;
        this.x = x;
        this.y = y;
    }
    MIOPoint.Zero = function () {
        var p = new MIOPoint(0, 0);
        return p;
    };
    return MIOPoint;
}());
var MIOSize = (function () {
    function MIOSize(w, h) {
        this.width = 0;
        this.height = 0;
        this.width = w;
        this.height = h;
    }
    MIOSize.Zero = function () {
        var s = new MIOSize(0, 0);
        return s;
    };
    MIOSize.prototype.isEqualTo = function (size) {
        if (this.width == size.width
            && this.height == size.height)
            return true;
        return false;
    };
    return MIOSize;
}());
var MIOFrame = (function () {
    function MIOFrame(p, s) {
        this.origin = null;
        this.size = null;
        this.origin = p;
        this.size = s;
    }
    MIOFrame.Zero = function () {
        var f = new MIOFrame(MIOPoint.Zero(), MIOSize.Zero());
        return f;
    };
    MIOFrame.frameWithRect = function (x, y, w, h) {
        var p = new MIOPoint(x, y);
        var s = new MIOSize(w, h);
        var f = new MIOFrame(p, s);
        return f;
    };
    return MIOFrame;
}());
//# sourceMappingURL=MIOCoreTypes.js.map