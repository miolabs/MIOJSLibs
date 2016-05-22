/**
 * Created by godshadow on 12/4/16.
 */

    /// <reference path="MIOObject.ts" />
    /// <reference path="MIOPredicate.ts" />

class MIOFetchRequest extends MIOObject
{
    entityName = null;
    predicate = null;

    static fetchRequestWithEntityName(name)
    {
        var fetch = new MIOFetchRequest();
        fetch.initWithEntityName(name);

        return fetch;
    }

    initWithEntityName(name)
    {
        this.entityName = name;
    }

    setPredicate(predicate)
    {
        this.predicate = predicate;
    }
}

class MIOFetchSection extends MIOObject
{
    objects = [];

    numberOfObjects()
    {
        return this.objects.length;
    }
}

class MIOFetchedResultsController extends MIOObject
{
    _delegate = null;
    sections = [];

    resultObjects = [];
    objects = [];

    private _request = null;
    private _moc = null;
    private _sectionNameKeyPath = null;

    initWithFetchRequest(request, managedObjectContext, sectionNameKeyPath)
    {
        this._request = request;
        this._moc = managedObjectContext;
        this._sectionNameKeyPath = sectionNameKeyPath;
    }

    get delegate()
    {
        return this._delegate;
    }

    set delegate(delegate)
    {
        this._delegate = delegate;

        // TODO: Add and remove notification observer
    }

    performFetch()
    {
        this.objects = this._moc.executeFetch(this._request);
        this.resultObjects = null;

        this._filterObjects();
        this._sortObjects();
        this._splitInSections();
    }

    updateContent(objects)
    {
        this.objects = objects;
        this.resultObjects = null;

        this._filterObjects();
        this._sortObjects();
        this._splitInSections();

        this._notify();
    }

    _notify()
    {
        if (this._delegate != null)
        {
            if (typeof this._delegate.controllerWillChangeContent === "function")
                this._delegate.controllerWillChangeContent(this);

            for (var sectionIndex = 0; sectionIndex < this.sections.length; sectionIndex++)
            {
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
    }

    private _filterObjects()
    {
        if (this._request.predicate == null)
            this.resultObjects = this.objects;
        else
        {
            var predicate = this._request.predicate;
            this.resultObjects = this.objects.filter(function(booking){

                var result = predicate.evaluateObject(booking);
                if (result)
                    return booking;
            });
        }
    }

    private _sortObjects()
    {
        if (this._sectionNameKeyPath == null)
            return;

        var key = this._sectionNameKeyPath;
        this.resultObjects = this.resultObjects.sort(function(a, b){

            if (a[key] == b[key]) {

                if (a[key]== b[key])
                    return 0;
                else if (a[key] < b[key])
                    return -1
                else
                    return 1;
            }
            else if (a[key] < b[key])
                return -1;
            else
                return 1;
        });

    }

    private _splitInSections()
    {
        this.sections = [];

        if (this._sectionNameKeyPath == null)
        {
            var section = new MIOFetchSection();
            section.objects = this.resultObjects;

            this.sections.push(section);
        }
        else
        {
            var currentSection = null;
            var currentSectionKeyPathValue = "";
            for (var index = 0; index < this.resultObjects.length; index++)
            {
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
    }

    objectAtIndexPath(row, section)
    {
        var section = this.sections[section];
        var object = section.objects[row];
        return object;
    }

}
