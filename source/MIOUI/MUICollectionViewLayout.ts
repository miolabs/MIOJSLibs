import { MIOObject, MIOSize, MIOIndexPath } from "../MIOFoundation";
import { MUICollectionView } from "./MUICollectionView";
import { MUICollectionViewLayoutAttributes } from "./MUICollectionViewLayoutAttributes";
import { MUICollectionViewUpdateItem } from "./MUICollectionViewUpdateItem";
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

    get collectionViewContentSize():MIOSize {return MIOSize.Zero();}

    layoutAttributesForItemAtIndexPath(indexPath:MIOIndexPath):MUICollectionViewLayoutAttributes{return null};

    prepareForCollectionViewUpdates(updateItems:MUICollectionViewUpdateItem[]){}
    initialLayoutAttributesForAppearingItemAtIndexPath(itemIndexPath:MIOIndexPath):MUICollectionViewLayoutAttributes {return null;}
    finalLayoutAttributesForDisappearingItemAtIndexPath(itemIndexPath:MIOIndexPath):MUICollectionViewLayoutAttributes {return null;}
    finalizeCollectionViewUpdates(){}
}

export enum MIOCollectionViewScrollDirection {
    Vertical,
    Horizontal
}

export class MUICollectionViewFlowLayout extends MUICollectionViewLayout
{
    scrollDirection = MIOCollectionViewScrollDirection.Vertical;

    init(){
        super.init();

        this.minimumLineSpacing = 10;
        this.minimumInteritemSpacing = 10;
        this.itemSize = new MIOSize(50, 50);
    }
}