/**
 * Created by godshadow on 12/4/16.
 */

/// <reference path="../MIOFoundation/MIOFoundation.ts" />

/// <reference path="MIOFetchRequest.ts" />    
/// <reference path="MIOManagedObjectContext.ts" />

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

    private _request:MIOFetchRequest = null;
    private _moc = null;
    private _sectionNameKeyPath = null;

    initWithFetchRequest(request, managedObjectContext, sectionNameKeyPath?)
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

        if (delegate != null) {
            MIONotificationCenter.defaultCenter().addObserver(this, MIOManagedObjectContextDidSaveNotification, function(notification:MIONotification){

                let moc:MIOManagedObjectContext = notification.object;
                if (moc !== this._moc) return;

                var ins_objs = notification.userInfo[MIOInsertedObjectsKey];
                var upd_objs = notification.userInfo[MIOUpdatedObjectsKey];
                var del_objs = notification.userInfo[MIODeletedObjectsKey];
                
                var entityName = this._request.entityName;                
                
                if (ins_objs[entityName] != null || upd_objs[entityName] != null || del_objs[entityName] != null)
                    this.updateContent( ins_objs[entityName]?ins_objs[entityName]:[], 
                                        upd_objs[entityName]?upd_objs[entityName]:[], 
                                        del_objs[entityName]?del_objs[entityName]:[]);
            });
        }
        else {
            MIONotificationCenter.defaultCenter().removeObserver(this, MIOManagedObjectContextDidSaveNotification);
        }
    }

    performFetch()
    {
        this.objects = this._moc.executeFetch(this._request);
        this.resultObjects = null;

        if (this.objects.length == 0)
            this.resultObjects = this.objects;
        else {
            this.resultObjects = this.objects;
            this._splitInSections();
        }
    }

    updateContent(inserted, updated, deleted)
    {
        // Process inserted objects
        for(var i = 0; i < inserted.length; i++) {
            let o = inserted[i];
            this.objects.push(o);
        }

        // Process updated objects
        // TODO: Check if the sort descriptor keys changed. If not do nothing becuse the objects are already
        //       in the fetched objects array

        // Process delete objects
        for(var i = 0; i < deleted.length; i++) {
            let o = deleted[i];
            let index = this.objects.indexOf(o);
            if (index != -1){
                this.objects.splice(index, 1);
            }
        }        

        this.objects = _MIOPredicateFilterObjects(this.objects, this._request.predicate);
        this.objects = _MIOSortDescriptorSortObjects(this.objects, this._request.sortDescriptors);
        this.resultObjects = this.objects;
        this._splitInSections();

        this._notify();
    }

    private _notify()
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
                let obj = this.resultObjects[index];
                let value = obj.valueForKey(this._sectionNameKeyPath);

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
