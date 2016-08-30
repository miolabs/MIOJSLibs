/**
 * Created by godshadow on 29/08/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOView.ts" />
/// <reference path="MIOButton.ts" />
var MIOSegmentedControl = (function (_super) {
    __extends(MIOSegmentedControl, _super);
    function MIOSegmentedControl() {
        _super.apply(this, arguments);
        this.segmentedItems = [];
    }
    MIOSegmentedControl.prototype.initWithLayer = function (layer) {
        _super.prototype.initWithLayer.call(this, layer);
        // Check for segmented items
        for (var index = 0; index < layer.childNodes.length; index++) {
            var itemLayer = layer.childNodes[index];
            if (itemLayer.tagName == "DIV") {
                var si = new MIOButton();
                si.initWithLayer(itemLayer, MIOButton.type);
                this._addSegmentedItem(si);
            }
        }
    };
    MIOSegmentedControl.prototype._addSegmentedItem = function (item) {
        this.segmentedItems.push(item);
    };
    return MIOSegmentedControl;
}(MIOView));
//# sourceMappingURL=MIOSegmentedControl.js.map