
/// <reference path="../MIOFoundation/MIOFoundation.ts" />


enum MIOAttributeType {

    UndefinedAttributeType,
    StringAttributeType,
    NumberAttributeType
}

class MIOAttributeDescription extends MIOObject
{
    attributeType = MIOAttributeType.UndefinedAttributeType;
    defaultValue = null;

    initWithType(type:MIOAttributeType, defaultValue){

        super.init();

        type = type;
        defaultValue = defaultValue;
    }
}