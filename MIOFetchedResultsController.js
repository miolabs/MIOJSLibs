/**
 * Created by godshadow on 12/4/16.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="MIOObject.ts" />
/// <reference path="MIOPredicate.ts" />
/// <reference path="MIONotificationCenter.ts" />
/// <reference path="MIOManagedObjectContext.ts" />
var MIOFetchSection = (function (_super) {
    __extends(MIOFetchSection, _super);
    function MIOFetchSection() {
        _super.apply(this, arguments);
        this.objects = [];
    }
    MIOFetchSection.prototype.numberOfObjects = function () {
        return this.objects.length;
    };
    return MIOFetchSection;
}(MIOObject));
var MIOFetchedResultsController = (function (_super) {
    __extends(MIOFetchedResultsController, _super);
    function MIOFetchedResultsController() {
        _super.apply(this, arguments);
        this._delegate = null;
        this.sections = [];
        this.resultObjects = [];
        this.objects = [];
        this._request = null;
        this._moc = null;
        this._sectionNameKeyPath = null;
    }
    MIOFetchedResultsController.prototype.initWithFetchRequest = function (request, managedObjectContext, sectionNameKeyPath) {
        this._request = request;
        this._moc = managedObjectContext;
        this._sectionNameKeyPath = sectionNameKeyPath;
    };
    Object.defineProperty(MIOFetchedResultsController.prototype, "delegate", {
        get: function () {
            return this._delegate;
        },
        set: function (delegate) {
            this._delegate = delegate;
            // TODO: Add and remove notification observer
            if (delegate != null) {
                MIONotificationCenter.defaultCenter().addObserver(this, "MIO" + this._request.entityName, function (notification) {
                    var array = notification.object;
                    this.updateContent(array);
                });
            }
            else {
                MIONotificationCenter.defaultCenter().removeObserver(this, "MIO" + this._request.entityName);
            }
        },
        enumerable: true,
        configurable: true
    });
    MIOFetchedResultsController.prototype.performFetch = function () {
        this.objects = this._moc.executeFetch(this._request);
        this.resultObjects = null;
        if (this.objects.length == 0)
            this.resultObjects = this.objects;
        else {
            this.resultObjects = this.objects;
            this._sortObjects();
            this._splitInSections();
        }
    };
    MIOFetchedResultsController.prototype.updateContent = function (objects) {
        //this.objects = objects;
        this.objects = this._moc.executeFetch(this._request);
        this.resultObjects = this.objects;
        this._sortObjects();
        this._splitInSections();
        this._notify();
    };
    MIOFetchedResultsController.prototype._notify = function () {
        if (this._delegate != null) {
            if (typeof this._delegate.controllerWillChangeContent === "function")
                this._delegate.controllerWillChangeContent(this);
            for (var sectionIndex = 0; sectionIndex < this.sections.length; sectionIndex++) {
                if (typeof this._delegate.didChangeSection === "function")
                    this._delegate.didChangeSection(this, sectionIndex, "insert");
                if (typeof this._delegate.didChangeObject === "function") {
                    var section = this.sections[sectionIndex];
                    var items = section.objects;
                    for (var index = 0; index < items.length; index++) {
                        var obj = items[index];
                        this._delegate.didChangeObject(this, index, "insert", obj);
                    }
                }
            }
            if (typeof this._delegate.controllerDidChangeContent === "function")
                this._delegate.controllerDidChangeContent(this);
        }
    };
    MIOFetchedResultsController.prototype._sortObjects = function () {
        if (this._sectionNameKeyPath == null)
            return;
        var key = this._sectionNameKeyPath;
        this.resultObjects = this.resultObjects.sort(function (a, b) {
            if (a[key] == b[key]) {
                if (a[key] == b[key])
                    return 0;
                else if (a[key] < b[key])
                    return -1;
                else
                    return 1;
            }
            else if (a[key] < b[key])
                return -1;
            else
                return 1;
        });
    };
    MIOFetchedResultsController.prototype._splitInSections = function () {
        this.sections = [];
        if (this._sectionNameKeyPath == null) {
            var section = new MIOFetchSection();
            section.objects = this.resultObjects;
            this.sections.push(section);
        }
        else {
            var currentSection = null;
            var currentSectionKeyPathValue = "";
            for (var index = 0; index < this.resultObjects.length; index++) {
                var obj = this.resultObjects[index];
                var value = obj[this._sectionNameKeyPath];
                if (currentSectionKeyPathValue != value) {
                    currentSection = new MIOFetchSection();
                    this.sections.push(currentSection);
                    currentSectionKeyPathValue = value;
                }
                currentSection.objects.push(obj);
            }
        }
    };
    MIOFetchedResultsController.prototype.objectAtIndexPath = function (row, section) {
        var section = this.sections[section];
        var object = section.objects[row];
        return object;
    };
    return MIOFetchedResultsController;
}(MIOObject));
//# sourceMappingURL=MIOFetchedResultsController.js.map