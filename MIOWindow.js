/**
 * Created by godshadow on 11/3/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOView.ts" />
var MIOWindow = (function (_super) {
    __extends(MIOWindow, _super);
    function MIOWindow() {
        _super.apply(this, arguments);
        this.rootViewController = null;
    }
    MIOWindow.prototype.init = function () {
        this.layer = document.createElement("div");
        this.layer.setAttribute("id", "window");
        this.layer.style.position = "absolute";
        this.layer.style.left = "0px";
        this.layer.style.top = "0px";
        this.layer.style.width = "100%";
        this.layer.style.height = "100%";
        // Only windows
        document.body.appendChild(this.layer);
    };
    MIOWindow.prototype.initWithRootViewController = function (vc) {
        this.init();
        this.rootViewController = vc;
        this.addSubview(vc.view);
    };
    return MIOWindow;
}(MIOView));
//# sourceMappingURL=MIOWindow.js.map