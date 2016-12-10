/**
 * Created by godshadow on 29/08/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOControl.ts" />
/// <reference path="MIOButton.ts" />
var MIOSegmentedControl = (function (_super) {
    __extends(MIOSegmentedControl, _super);
    function MIOSegmentedControl() {
        _super.apply(this, arguments);
        this.segmentedItems = [];
        this.selectedSegmentedIndex = -1;
    }
    MIOSegmentedControl.prototype.initWithLayer = function (layer, options) {
        _super.prototype.initWithLayer.call(this, layer, options);
        // Check for segmented items
        var opts = {};
        var sp = layer.getAttribute("data-status-style-prefix");
        if (sp != null)
            opts["status-style-prefix"] = sp;
        for (var index = 0; index < this.layer.childNodes.length; index++) {
            var itemLayer = this.layer.childNodes[index];
            if (itemLayer.tagName == "DIV") {
                var si = new MIOButton();
                si.initWithLayer(itemLayer, opts);
                si.type = MIOButtonType.PushIn;
                this._addSegmentedItem(si);
            }
        }
        if (this.segmentedItems.length > 0) {
            var item = this.segmentedItems[0];
            item.setSelected(true);
            this.selectedSegmentedIndex = 0;
        }
    };
    MIOSegmentedControl.prototype._addSegmentedItem = function (item) {
        this.segmentedItems.push(item);
        item.setAction(this, this._didClickSegmentedButton);
    };
    MIOSegmentedControl.prototype._didClickSegmentedButton = function (button) {
        var index = this.segmentedItems.indexOf(button);
        this.selectSegmentedAtIndex(index);
        if (this.mouseOutTarget != null)
            this.mouseOutAction.call(this.mouseOutTarget, index);
    };
    MIOSegmentedControl.prototype.setAction = function (target, action) {
        this.mouseOutTarget = target;
        this.mouseOutAction = action;
    };
    MIOSegmentedControl.prototype.selectSegmentedAtIndex = function (index) {
        if (this.selectedSegmentedIndex == index)
            return;
        if (this.selectedSegmentedIndex > -1) {
            var lastItem = this.segmentedItems[this.selectedSegmentedIndex];
            lastItem.setSelected(false);
        }
        this.selectedSegmentedIndex = index;
    };
    return MIOSegmentedControl;
}(MIOControl));
//# sourceMappingURL=MIOSegmentedControl.js.map