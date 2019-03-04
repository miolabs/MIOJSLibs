import { 
    MIOCoreStringLastPathComponent, 
    MIOCoreStringAppendPathComponent,     
    MIOCoreStringPathExtension,
    MIOCoreStringDeletingLastPathComponent, 
    MIOCoreStringHasPreffix, 
    MIOCoreStringHasSuffix 
} from ".";

//For code completion the interface is defined in types/mio/index.d.ts

String.prototype.lastPathComponent = function():string{
    return MIOCoreStringLastPathComponent(this);
}

String.prototype.pathExtension = function():string{
    return MIOCoreStringPathExtension(this);
} 

String.prototype.stringByAppendingPathComponent = function(path:string):string{
    return MIOCoreStringAppendPathComponent(this, path);
}

String.prototype.stringByDeletingLastPathComponent = function():string{
    return MIOCoreStringDeletingLastPathComponent(this);
}

String.prototype.hasPreffix = function(preffix:string):boolean{
    return MIOCoreStringHasPreffix(this, preffix);
}

String.prototype.hasSuffix = function(suffix:string):boolean{
    return MIOCoreStringHasSuffix(this, suffix);
}