import { MUIView, MUINavigationItem, MUICoreLayerAddStyle } from ".";

export class MUINavigationBar extends MUIView
{
    init(){
        super.init();
        this.setup();
    }

    initWithLayer(layer, owner, options?){
        super.initWithLayer(layer, owner, options);
        this.setup();
    }

    private setup(){
        MUICoreLayerAddStyle(this.layer, "navbar");
    }

    private _items = [];
    get items(){return this._items;}
    setItems(items, animated){        
        this._items = items;

        //TODO: Animate!!!
    }    
    
    pushNavigationItem(item:MUINavigationItem, animated){
        this.items.addObject(item);
        // TODO: Make the animation and change the items
    }

    popNavigationItem(item:MUINavigationItem, animated) {
        this.items.removeObject(item);
        // TODO: Make the animation and change the items
    }

    get topItem(){
        if (this.items.length == 0) return null;
        return this.items[this.items.length - 1];
    }

    get backItem(){
        if (this.items.length < 2) return null;
        return this.items[this.items.length - 2];
    }
}