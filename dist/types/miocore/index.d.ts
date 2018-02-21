interface Navigator {
    userLanguage: any;
}
declare enum MIOCoreBrowserType {
    Safari = 0,
    Chrome = 1,
    IE = 2,
    Edge = 3,
    Other = 4,
}
declare function MIOCoreGetBrowser(): MIOCoreBrowserType;
declare function MIOCoreGetBrowserLocale(): any;
declare function MIOCoreGetBrowserLanguage(): any;
declare function MIOCoreGetMainBundleURLString(): string;
declare function MIOCoreIsPhone(): any;
declare function MIOCoreIsPad(): any;
declare function MIOCoreIsMobile(): any;
declare function MIOCoreLoadScript(url: any): void;
declare var _stylesCache: {};
declare function _MIOCoreLoadStyle_test1(url: any, target?: any, completion?: any): void;
interface StyleSheet {
    cssRules: any;
}
declare function _MIOCoreLoadStyle_test2(url: any, target?: any, completion?: any): void;
declare function MIOCoreLoadStyle(url: any, media: any, target?: any, completion?: any): void;
declare function main(args: any): any;
declare var _miocore_events_event_observers: {};
declare function MIOCoreEventRegisterObserverForType(eventType: MIOCoreEventType, observer: any, completion: any): void;
declare function MIOCoreEventUnregisterObserverForType(eventType: MIOCoreEventType, observer: any): void;
declare function _MIOCoreEventSendToObservers(obs: any, event: MIOCoreEvent): void;
declare function MIOCoreStringHasPreffix(str: any, preffix: any): boolean;
declare function MIOCoreStringHasSuffix(str: any, suffix: any): boolean;
declare function MIOCoreStringAppendPathComponent(string: string, path: any): string;
declare function MIOCoreStringLastPathComponent(string: string): string;
declare function MIOCoreStringDeletingLastPathComponent(string: string): string;
declare function MIOCoreStringStandardizingPath(string: any): string;
declare class MIOCoreBundle {
    baseURL: string;
    private _layoutWorker;
    private _layoutQueue;
    private _layoutCache;
    private _isDownloadingResource;
    private _loadingCSSCount;
    loadHMTLFromPath(path: any, layerID: any, target: any, completion: any): void;
    private checkQueue();
    private layerDidDownload(layer);
    private _checkDownloadCount();
}
declare enum MIOCoreDebugOption {
    Phone = 0,
    Pad = 1,
    Mobile = 2,
    Desktop = 3,
}
declare var _MIOCoreDebugOptions: {};
declare function MIOCoreSetDebugOption(option: any, value: any): void;
declare enum MIOCoreAppType {
    Web = 0,
    iOS = 1,
    macOS = 2,
    Android = 3,
    WindowsMobile = 4,
    Windows = 5,
    Linux = 6,
}
declare var _miocore_app_type: MIOCoreAppType;
declare function MIOCoreSetAppType(appType: MIOCoreAppType): void;
declare function MIOCoreGetAppType(): MIOCoreAppType;
declare function MIOClassFromString(className: any): any;
declare function MIOCoreCreateMD5(s: any): string;
declare let _miocore_languages: any;
declare function MIOCoreAddLanguage(lang: any, url: any): void;
declare function MIOCoreGetLanguages(): any;
declare enum MIOCoreEventKeyCode {
    Enter = 13,
    Escape = 27,
    ArrowLeft = 37,
    ArrowUp = 38,
    ArrowRight = 39,
    ArrowDown = 40,
}
declare enum MIOCoreEventType {
    KeyUp = 0,
    KeyDown = 1,
    MouseUp = 2,
    MouseDown = 3,
    TouchStart = 4,
    TouchEnd = 5,
    Click = 6,
    Resize = 7,
}
declare class MIOCoreEvent {
    coreEvent: Event;
    eventType: any;
    target: any;
    completion: any;
    initWithType(eventType: MIOCoreEventType, coreEvent: Event): void;
    cancel(): void;
}
declare class MIOCoreKeyEvent extends MIOCoreEvent {
    keyCode: any;
    initWithKeyCode(eventType: MIOCoreEventType, eventKeyCode: MIOCoreEventKeyCode, event: Event): void;
}
declare class MIOCoreEventInput extends MIOCoreEvent {
    target: any;
    x: number;
    y: number;
    deltaX: number;
    deltaY: number;
}
declare enum MIOCoreEventMouseButtonType {
    None = 0,
    Left = 1,
    Right = 2,
    Middle = 3,
}
declare class MIOCoreEventMouse extends MIOCoreEventInput {
    button: MIOCoreEventMouseButtonType;
    initWithType(eventType: MIOCoreEventType, coreEvent: MouseEvent): void;
}
declare class MIOCoreEventTouch extends MIOCoreEventInput {
    initWithType(eventType: MIOCoreEventType, coreEvent: TouchEvent): void;
}
declare enum MIOCoreLexerTokenType {
    Identifier = 0,
    UUIDValue = 1,
    StringValue = 2,
    NumberValue = 3,
    BooleanValue = 4,
    NullValue = 5,
    PropertyValue = 6,
    MinorOrEqualComparator = 7,
    MinorComparator = 8,
    MajorOrEqualComparator = 9,
    MajorComparator = 10,
    EqualComparator = 11,
    DistinctComparator = 12,
    ContainsComparator = 13,
    NotContainsComparator = 14,
    InComparator = 15,
    NotIntComparator = 16,
    OpenParenthesisSymbol = 17,
    CloseParenthesisSymbol = 18,
    Whitespace = 19,
    AND = 20,
    OR = 21,
}
declare class MIOCoreLexer {
    private input;
    private tokenTypes;
    private tokens;
    private tokenIndex;
    private ignoreTokenTypes;
    constructor(string: string);
    addTokenType(type: any, regex: any): void;
    ignoreTokenType(type: any): void;
    tokenize(): void;
    private _tokenize();
    nextToken(): any;
    prevToken(): any;
}
