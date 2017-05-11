
/// <reference path="../MIOFoundation/MIOFoundation.ts" />

class MIOFetchRequest extends MIOObject {
    entityName = null;
    predicate = null;
    sortDescriptors = null;

    static fetchRequestWithEntityName(name) {
        var fetch = new MIOFetchRequest();
        fetch.initWithEntityName(name);

        return fetch;
    }

    initWithEntityName(name) {
        this.entityName = name;
    }
}
