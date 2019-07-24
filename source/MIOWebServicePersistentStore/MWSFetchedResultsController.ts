
import {MIOFetchedResultsController} from "../MIOData/MIOFetchedResultsController"
import { MWSPersistentStore } from "./MWSPersistentStore";

export class MWSFetchedResultsController extends MIOFetchedResultsController
{
    webPersistentStore:MWSPersistentStore = null;

    private itemOffset = 0;

    performNextFetch(){        
        this.itemOffset += this.fetchRequest.fetchLimit;
        this.fetchRequest.fetchOffset = this.itemOffset;
        
        let request = this.fetchRequest;        
        this.webPersistentStore.fetchObjects(request, this.managedObjectContext, this, function(objects){            
        });         
    }

}