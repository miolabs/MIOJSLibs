/**
 * Created by godshadow on 30/3/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOCore.ts" />
var MIOLocale = (function (_super) {
    __extends(MIOLocale, _super);
    function MIOLocale() {
        _super.call(this);
    }
    MIOLocale.currentLocale = function () {
        return MIOWebApplication.sharedInstance().currentLanguage;
    };
    return MIOLocale;
}(MIOObject));
//# sourceMappingURL=MIOLocale.js.map