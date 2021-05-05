
export var _MUICoreLayerIDCount = 0;

export function MUICoreLayerIDFromObject(object): string {

    var classname = object.constructor.name.substring(3);
    return MUICoreLayerIDFromClassname(classname);
}

export function MUICoreLayerIDFromClassname(classname:string): string {

    var digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];

    var random = "";
    for (var count = 0; count < 4; count++) {
        var randomNumber = Math.floor(Math.random() * 16);
        var randomDigit = digits[randomNumber];
        random += randomDigit;
    }

    var layerID = classname.toLowerCase() + "_" + random;
    _MUICoreLayerIDCount++;

    return layerID;
}

export function MUICoreLayerCreate(layerID?, type?:string) {
    var layer = document.createElement(type || "DIV");
    if (layerID != null)
        layer.setAttribute("id", layerID);

    //layer.style.position = "absolute";

    return layer;
}

export function MUICoreLayerAddSublayer(layer, subLayer){    
    layer.appendChild(subLayer);
}

export function MUICoreLayerRemoveSublayer(layer, subLayer){    
    layer.removeChild(subLayer);
}

export function MUICoreLayerCreateWithStyle(style, layerID?, type?:string) {
    var layer = MUICoreLayerCreate(layerID, type);
    MUICoreLayerAddStyle(layer, style);

    return layer;
}

export function MUICoreLayerAddStyle(layer, style: string) {
    const classes = style.split( " " ).filter( c => c !== "" ) ;

    for ( const c of classes )
          layer.classList.add( c ) ;
}

export function MUICoreLayerRemoveStyle(layer, style: string) {
    const classes = style.split( " " ).filter( c => c !== "" ) ;

    for ( const c of classes )
          layer.classList.remove( c ) ;
}

export function MUICoreLayerCreateFromLayer(layer) {
    return layer.cloneNode(true);
}


