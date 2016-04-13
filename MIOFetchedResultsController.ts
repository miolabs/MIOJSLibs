/**
 * Created by godshadow on 12/4/16.
 */

    /// <reference path="MIOObject.ts" />

class MIOFetchRequest extends MIOObject
{
    entityName = null;

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
    delegate = null;
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

    performFetch()
    {
        this._moc.executeFetch(this._request, this, this.updateContent);
    }

    updateContent(objects)
    {
        this.objects = objects;

        this._filterObjects(null, null);
        this._sortObjects();
        this._splitInSections();

        this._notify();
    }

    _notify()
    {
        if (this.delegate != null)
        {
            if (typeof this.delegate.controllerWillChangeContent === "function")
                this.delegate.controllerWillChangeContent(this);

            for (var sectionIndex = 0; sectionIndex < this.sections.length; sectionIndex++)
            {
                if (typeof this.delegate.didChangeSection === "function")
                    this.delegate.didChangeSection(this, sectionIndex, "insert");

                if (typeof this.delegate.didChangeObject === "function") {
                    var section = this.sections[sectionIndex];
                    var items = section.objects;
                    for (var index = 0; index < items.length; index++) {
                        var obj = items[index];
                        this.delegate.didChangeObject(this, index, "insert", obj);
                    }
                }
            }

            if (typeof this.delegate.controllerDidChangeContent === "function")
                this.delegate.controllerDidChangeContent(this);
        }
    }

    setPredicate(key, value)
    {
        this._filterObjects(key, value);
        this._sortObjects();
        this._splitInSections();

        this._notify();
    }

    private _filterObjects(key, value)
    {
        if (key == null)
            this.resultObjects = this.objects;
        else
        {
            this.resultObjects = this.objects.filter(function(booking){

                var value1 = booking[key].toLowerCase();
                if (value1.indexOf(value.toLowerCase()) > -1)
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