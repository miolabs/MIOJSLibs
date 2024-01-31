
/**
 * Created by godshadow on 28/09/2016.
 */

import { MIOSortDescriptor, _MIOSortDescriptorSortObjects } from "./MIOSortDescriptor";

declare global {
    interface Array<T> {
        sortedArrayUsingDescriptors( sortDescriptors:MIOSortDescriptor[] ) : any ;
    }
}


Array.prototype.sortedArrayUsingDescriptors = function(sortDescriptors:MIOSortDescriptor[]) {
    return _MIOSortDescriptorSortObjects(this, sortDescriptors);
}


