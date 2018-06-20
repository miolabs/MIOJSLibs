export function MIOCoreGetMainBundleURLString() {
    return "";
}

export class MIOCoreBundle {
    baseURL: string;
    loadHMTLFromPath(path, layerID, instance, callback) {}
}

export enum MIOCoreBrowserType
{
    Safari,
    Chrome,
    IE,
    Edge,
    Other
}

export function MIOCoreGetBrowser() {
    return MIOCoreBrowserType.Other
}

export function MIOClassFromString(name){
    return null
}