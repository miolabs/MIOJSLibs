/**
 * Created by godshadow on 28/09/2016.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOObject.ts" />
var MIOSortDescriptor = (function (_super) {
    __extends(MIOSortDescriptor, _super);
    function MIOSortDescriptor() {
        _super.apply(this, arguments);
        this.key = null;
        this.ascending = false;
    }
    MIOSortDescriptor.sortDescriptorWithKey = function (key, ascending) {
        var sd = new MIOSortDescriptor();
        sd.initWithKey(key, ascending);
        return sd;
    };
    MIOSortDescriptor.prototype.initWithKey = function (key, ascending) {
        this.key = key;
        this.ascending = ascending;
    };
    return MIOSortDescriptor;
}(MIOObject));
