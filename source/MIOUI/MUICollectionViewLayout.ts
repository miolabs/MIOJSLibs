import { MIOObject, MIOSize } from "../MIOFoundation";
import { MUICollectionView } from "./MUICollectionView";
import { MUIEdgeInsets } from "./MUIEdgeInsets";

export class MUICollectionViewLayout extends MIOObject
{    
    collectionView:MUICollectionView = null;

    minimumLineSpacing = 0;
    minimumInteritemSpacing = 0;
    itemSize = new MIOSize(0,0);
    estimatedItemSize = new MIOSize(0,0);
    sectionInset:MUIEdgeInsets = null;
    headerReferenceSize:MIOSize = new MIOSize(0, 0);
    footerReferenceSize:MIOSize = new MIOSize(0, 0);

    init(){
        super.init();

        this.sectionInset = new MUIEdgeInsets();
        this.sectionInset.init();
    }

    invalidateLayout(){}
}

export class MUICollectionViewFlowLayout extends MUICollectionViewLayout
{
    init(){
        super.init();

        this.minimumLineSpacing = 10;
        this.minimumInteritemSpacing = 10;
        this.itemSize = new MIOSize(50, 50);
    }
}