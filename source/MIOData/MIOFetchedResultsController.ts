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

    fetchRequest:MIOFetchRequest = null;
    managedObjectContext:MIOManagedObjectContext  = null;
    sectionNameKeyPath = null;

    initWithFetchRequest(request, managedObjectContext, sectionNameKeyPath?)
    {
        this.fetchRequest = request;
        this.managedObjectContext = managedObjectContext;
        this.sectionNameKeyPath = sectionNameKeyPath;
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
                if (moc !== this.managedObjectContext) return;

                var ins_objs = notification.userInfo[MIOInsertedObjectsKey];
                var upd_objs = notification.userInfo[MIOUpdatedObjectsKey];
                var del_objs = notification.userInfo[MIODeletedObjectsKey];
                
                var entityName = this.fetchRequest.entityName;                
                
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
        this.resultObjects = this.managedObjectContext.executeFetch(this.fetchRequest);
        this._splitInSections();
    }

    updateContent(inserted, updated, deleted)
    {
        // Process inserted objects
        for(var i = 0; i < inserted.length; i++) {
            let o = inserted[i];
            this.resultObjects.push(o);
        }

        // Process updated objects
        // TODO: Check if the sort descriptor keys changed. If not do nothing becuse the objects are already
        //       in the fetched objects array

        // Process delete objects
        for(var i = 0; i < deleted.length; i++) {
            let o = deleted[i];
            let index = this.resultObjects.indexOf(o);
            if (index != -1){
                this.resultObjects.splice(index, 1);
            }
        }        

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

        if (this.sectionNameKeyPath == null)
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
                let value = obj.valueForKey(this.sectionNameKeyPath);

                if (currentSectionKeyPathValue != value) {
                    currentSection = new MIOFetchSection();
                    this.sections.push(currentSection);
                    currentSectionKeyPathValue = value;
                }

                currentSection.objects.push(obj);
            }
        }
    }

    objectAtIndexPath(indexPath:MIOIndexPath)
    {
        var section = this.sections[indexPath.section];
        var object = section.objects[indexPath.row];
        return object;
    }

}
