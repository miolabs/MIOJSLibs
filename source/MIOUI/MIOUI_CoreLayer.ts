
var _MUICoreLayerIDCount = 0;

function MUICoreLayerIDFromObject(object) : string
{
    var digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];

    var random = "";
    for (var count = 0; count < 4; count++)
    {
        var randomNumber = Math.floor(Math.random() * 16);
        var randomDigit = digits[randomNumber];
        random += randomDigit;
    }

    var classname = object.constructor.name.substring(3);
    var layerID = classname.toLowerCase() + "_" +  random;
    _MUICoreLayerIDCount++;

    return layerID;
}
