//Implemented in: MIOCore/MIOArray.ts
interface Array<T> {
    addObject(object);
    removeObject(object);
    removeObjectAtIndex(index);
    objectAtIndex(index);
    indexOfObject(object);
    containsObject(object):boolean;
    count();
    firstObject();
    lastObject();
}

//Implemented in: MIOCore/MIOString.ts
interface String {
    stringByAppendingPathComponent(path:string):string;
    
    lastPathComponent():string;    
    stringByDeletingLastPathComponent():string;

    hasPreffix(preffix:string):boolean;
    hasSuffix(suffix:string):boolean;
}

// Browser specific additions
interface Window {
    webkitURL?: any;
}

// Webpack worker-loader module
declare module "worker-loader?*" {
    class WebpackWorker extends Worker {
        constructor();
    }
    export = WebpackWorker;
}