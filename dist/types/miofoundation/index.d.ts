interface Array<T> {
    addObject(object: any): any;
    removeObject(object: any): any;
    removeObjectAtIndex(index: any): any;
    objectAtIndex(index: any): any;
    indexOfObject(object: any): any;
    containsObject(object: any): boolean;
    count(): any;
}
declare class MIOObject {
    readonly className: any;
    keyPaths: {};
    init(): void;
    private _notifyValueChange(key, type);
    willChangeValueForKey(key: string): void;
    didChangeValueForKey(key: string): void;
    willChangeValue(key: string): void;
    didChangeValue(key: string): void;
    private _addObserver(obs, key, context, keyPath?);
    private _keyFromKeypath(keypath);
    addObserver(obs: any, keypath: string, context?: any): void;
    removeObserver(obs: any, keypath: string): void;
    setValueForKey(value: any, key: string): void;
    valueForKey(key: string): any;
    valueForKeyPath(keyPath: string): any;
    copy(): any;
}
declare enum MIOURLTokenType {
    Protocol = 0,
    Host = 1,
    Path = 2,
    Param = 3,
    Value = 4,
}
declare class MIOURL extends MIOObject {
    baseURL: MIOURL;
    absoluteString: string;
    scheme: string;
    user: string;
    password: any;
    host: string;
    port: number;
    hostname: string;
    path: string;
    file: string;
    pathExtension: string;
    params: any[];
    static urlWithString(urlString: string): MIOURL;
    initWithScheme(scheme: string, host: string, path: string): void;
    initWithURLString(urlString: string): void;
    private _parseURLString(urlString);
    urlByAppendingPathComponent(path: string): MIOURL;
    standardizedURL(): MIOURL;
}
declare class MIOBundle extends MIOObject {
    url: MIOURL;
    private static _mainBundle;
    private _webBundle;
    static mainBundle(): MIOBundle;
    initWithURL(url: MIOURL): void;
    loadHTMLNamed(path: any, layerID: any, target?: any, completion?: any): void;
    private _loadResourceFromURL(url, target, completion);
}
declare enum MIODateFirstWeekDay {
    Sunday = 0,
    Monday = 1,
}
declare var _MIODateFirstWeekDay: MIODateFirstWeekDay;
declare var _MIODateStringDays: string[];
declare var _MIODateStringMonths: string[];
declare function MIODateSetFirstWeekDay(day: MIODateFirstWeekDay): void;
declare function MIODateGetStringForMonth(month: any): string;
declare function MIODateGetStringForDay(day: number): string;
declare function MIODateGetDayFromDate(date: any): any;
declare function MIODateGetDayStringFromDate(date: any): string;
declare function MIODateGetString(date: any): string;
declare function MIODateGetDateString(date: any): string;
declare function MIODateGetTimeString(date: any): string;
declare function MIODateGetUTCString(date: any): string;
declare function MIODateGetUTCDateString(date: any): string;
declare function MIODateGetUTCTimeString(date: any): string;
declare function MIODateFromString(string: any): Date;
declare function MIODateToUTC(date: any): Date;
declare function MIODateAddDaysToDateString(dateString: any, days: any): string;
declare function MIODateRemoveDaysToDateString(dateString: any, days: any): string;
declare function MIODateFromMiliseconds(miliseconds: any): Date;
declare function isDate(x: any): boolean;
declare function MIODateToday(): Date;
declare function MIODateNow(): Date;
declare function MIODateTodayString(): string;
declare function MIODateYesterday(): Date;
declare function MIODateTomorrow(): Date;
declare function MIODateGetFirstDayOfTheWeek(date: Date): Date;
declare function MIODateGetLastDayOfTheWeek(date: Date): Date;
declare class MIOFormatter extends MIOObject {
    stringForObjectValue(value: any): any;
    getObjectValueForString(str: string): void;
    editingStringForObjectValue(value: any): void;
    isPartialStringValid(str: string): [boolean, string];
}
declare enum MIODateFormatterStyle {
    NoStyle = 0,
    ShortStyle = 1,
    MediumStyle = 2,
    LongStyle = 3,
    FullStyle = 4,
}
declare class MIODateFormatter extends MIOFormatter {
    dateStyle: MIODateFormatterStyle;
    timeStyle: MIODateFormatterStyle;
    private browserDateSeparatorSymbol;
    init(): void;
    dateFromString(str: string): Date;
    stringFromDate(date: Date): string;
    stringForObjectValue(value: any): string;
    isPartialStringValid(str: string): [boolean, string];
    private _parse(str);
    private _parseDate(str);
    private _parseDay(ch, dd);
    private _validateDay(dd);
    private _parseMonth(ch, mm);
    private _validateMonth(mm);
    private _parseYear(ch, yy);
    private _validateYear(yy);
    protected iso8601DateStyle(date: Date): string;
    private _shortDateStyle(date, separatorString?);
    private _fullDateStyle(date);
    private _parseTime(str);
    private _parseHour(ch, hh);
    private _parseMinute(ch, mm);
    private _parseSecond(ch, ss);
    protected iso8601TimeStyle(date: Date): string;
    private _shortTimeStyle(date);
}
declare var _MIODateFormatterStringDays: string[];
declare var _MIODateFormatterStringMonths: string[];
declare class MIONumber extends MIOObject {
    static numberWithBool(value: any): MIONumber;
    static numberWithInteger(value: any): MIONumber;
    static numberWithFloat(value: any): MIONumber;
    protected storeValue: any;
    initWithBool(value: any): void;
    initWithInteger(value: any): void;
    initWithFloat(value: any): void;
}
declare var Decimal: any;
declare class MIODecimalNumber extends MIONumber {
    static decimalNumberWithString(str: string): MIODecimalNumber;
    static one(): MIODecimalNumber;
    static zero(): MIODecimalNumber;
    static numberWithBool(value: any): MIODecimalNumber;
    static numberWithInteger(value: any): MIODecimalNumber;
    static numberWithFloat(value: any): MIODecimalNumber;
    initWithString(str: string): void;
    initWithDecimal(value: any): void;
    _initWithValue(value: any): void;
    decimalNumberByAdding(value: MIODecimalNumber): MIODecimalNumber;
    decimalNumberBySubtracting(value: MIODecimalNumber): MIODecimalNumber;
    decimalNumberByMultiplyingBy(value: MIODecimalNumber): MIODecimalNumber;
    decimalNumberByDividingBy(value: MIODecimalNumber): MIODecimalNumber;
    readonly decimalValue: any;
    readonly floatValue: any;
}
declare class MIOError extends MIOObject {
    errorCode: number;
}
declare class MIOPoint {
    x: number;
    y: number;
    static Zero(): MIOPoint;
    constructor(x: any, y: any);
}
declare class MIORange {
    location: number;
    length: number;
    constructor(location: any, length: any);
}
declare function MIOMaxRange(range: MIORange): Number;
declare function MIOEqualRanges(range1: MIORange, range2: MIORange): Boolean;
declare function MIOLocationInRange(location: Number, range: MIORange): boolean;
declare function MIOIntersectionRange(range1: MIORange, range2: MIORange): MIORange;
declare function MIOUnionRange(range1: MIORange, range2: MIORange): MIORange;
declare class MIOSize {
    width: number;
    height: number;
    static Zero(): MIOSize;
    constructor(w: any, h: any);
    isEqualTo(size: any): boolean;
}
declare class MIORect {
    origin: MIOPoint;
    size: MIOSize;
    static Zero(): MIORect;
    static rectWithValues(x: any, y: any, w: any, h: any): MIORect;
    constructor(p: any, s: any);
}
declare function MIORectMaxY(rect: MIORect): number;
declare function MIORectMinY(rect: MIORect): number;
declare class MIONull extends MIOObject {
    static nullValue(): MIONull;
}
declare var _MIOLocalizedStrings: any;
declare function MIOLocalizeString(key: any, defaultValue: any): any;
interface String {
    stringByAppendingPathComponent(path: string): string;
    lastPathComponent(): string;
    stringByDeletingLastPathComponent(): string;
    hasPreffix(preffix: string): boolean;
    hasSuffix(suffix: string): boolean;
}
declare class MIOUUID {
    constructor();
    static uuid(): string;
}
declare class MIOISO8601DateFormatter extends MIODateFormatter {
    static iso8601DateFormatter(): MIOISO8601DateFormatter;
    timeZone: any;
    dateFromString(str: string): Date;
    stringFromDate(date: Date): string;
}
declare enum MIOPredicateComparatorType {
    Equal = 0,
    Less = 1,
    LessOrEqual = 2,
    Greater = 3,
    GreaterOrEqual = 4,
    Distinct = 5,
    Contains = 6,
    NotContains = 7,
    In = 8,
    NotIn = 9,
}
declare enum MIOPredicateOperatorType {
    OR = 0,
    AND = 1,
}
declare enum MIOPredicateType {
    Predicate = 0,
    Item = 1,
    Operation = 2,
}
declare class MIOPredicateOperator {
    type: any;
    static andPredicateOperatorType(): MIOPredicateOperator;
    static orPredicateOperatorType(): MIOPredicateOperator;
    constructor(type: any);
}
declare enum MIOPredicateItemValueType {
    Undefined = 0,
    UUID = 1,
    String = 2,
    Number = 3,
    Boolean = 4,
    Null = 5,
    Property = 6,
}
declare class MIOPredicateItem {
    key: any;
    comparator: any;
    value: any;
    valueType: MIOPredicateItemValueType;
    evaluateObject(object: MIOObject): boolean;
}
declare class MIOPredicateGroup {
    predicates: any[];
    evaluateObject(object: any): boolean;
}
declare enum MIOPredicateTokenType {
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
declare class MIOPredicate extends MIOObject {
    predicateGroup: any;
    private lexer;
    static predicateWithFormat(format: any): MIOPredicate;
    initWithFormat(format: any): void;
    evaluateObject(object: MIOObject): any;
    private tokenizeWithFormat(format);
    private parse(format);
    private parsePredicates();
    private property(item);
    private comparator(item);
    private value(item);
    private booleanFromString(value);
    private nullFromString(value);
}
declare function _MIOPredicateFilterObjects(objs: any, predicate: any): any;
declare class MIOSet extends MIOObject {
    static set(): MIOSet;
    private _objects;
    addObject(object: any): void;
    removeObject(object: any): void;
    removeAllObjects(): void;
    indexOfObject(object: any): number;
    containsObject(object: any): boolean;
    objectAtIndex(index: any): any;
    readonly allObjects: any[];
    readonly count: number;
    readonly length: number;
    copy(): MIOSet;
    filterWithPredicate(predicate: MIOPredicate): any;
    addObserver(obs: any, keypath: string, context?: any): void;
}
declare function MIOIndexPathEqual(indexPath1: MIOIndexPath, indexPath2: MIOIndexPath): Boolean;
declare class MIOIndexPath extends MIOObject {
    static indexForRowInSection(row: number, section: number): MIOIndexPath;
    static indexForColumnInRowAndSection(column: number, row: number, section: number): MIOIndexPath;
    private indexes;
    add(value: number): void;
    readonly section: any;
    readonly row: any;
    readonly column: any;
}
declare var _mio_currentLocale: any;
declare class MIOLocale extends MIOObject {
    languageIdentifier: string;
    countryIdentifier: string;
    static currentLocale(): any;
    initWithLocaleIdentifier(identifer: string): void;
    readonly decimalSeparator: string;
    readonly currencySymbol: string;
    readonly groupingSeparator: string;
}
declare enum MIONumberFormatterStyle {
    NoStyle = 0,
    DecimalStyle = 1,
    CurrencyStyle = 2,
    PercentStyle = 3,
}
declare enum _MIONumberFormatterType {
    Int = 0,
    Decimal = 1,
}
declare class MIONumberFormatter extends MIOFormatter {
    numberStyle: MIONumberFormatterStyle;
    locale: any;
    minimumFractionDigits: number;
    maximumFractionDigits: number;
    groupingSeparator: any;
    init(): void;
    numberFromString(str: string): any;
    stringFromNumber(number: number): string;
    stringForObjectValue(value: any): string;
    isPartialStringValid(str: string): [boolean, string];
    private _parse(str);
}
declare class MIOTimer extends MIOObject {
    private _timerInterval;
    private _repeat;
    private _target;
    private _completion;
    private _coreTimer;
    static scheduledTimerWithTimeInterval(timeInterval: any, repeat: any, target: any, completion: any): MIOTimer;
    initWithTimeInterval(timeInterval: any, repeat: any, target: any, completion: any): void;
    fire(): void;
    invalidate(): void;
    private _timerCallback();
}
declare class MIONotification {
    name: any;
    object: any;
    userInfo: any;
    constructor(name: any, object: any, userInfo: any);
}
declare class MIONotificationCenter {
    private static _sharedInstance;
    notificationNames: {};
    constructor();
    static defaultCenter(): MIONotificationCenter;
    addObserver(obs: any, name: any, fn: any): void;
    removeObserver(obs: any, name: any): void;
    postNotification(name: any, object: any, userInfo?: any): void;
}
declare class MIOUserDefaults {
    private static _sharedInstance;
    constructor();
    static standardUserDefaults(): MIOUserDefaults;
    setBooleanForKey(key: any, value: boolean): void;
    booleanForKey(key: any): boolean;
    setValueForKey(key: any, value: any): void;
    valueForKey(key: any): string;
    removeValueForKey(key: any): void;
}
declare class MIOURLRequest extends MIOObject {
    url: MIOURL;
    httpMethod: string;
    httpBody: any;
    headers: any[];
    binary: boolean;
    download: boolean;
    static requestWithURL(url: MIOURL): MIOURLRequest;
    initWithURL(url: MIOURL): void;
    setHeaderField(field: any, value: any): void;
}
declare class MIOURLConnection {
    request: MIOURLRequest;
    delegate: any;
    blockFN: any;
    blockTarget: any;
    private xmlHttpRequest;
    initWithRequest(request: MIOURLRequest, delegate: any): void;
    initWithRequestBlock(request: MIOURLRequest, blockTarget: any, blockFN: any): void;
    start(): void;
}
declare enum MIOXMLTokenType {
    Identifier = 0,
    QuestionMark = 1,
    OpenTag = 2,
    CloseTag = 3,
    Slash = 4,
    Quote = 5,
    End = 6,
}
declare class MIOXMLParser extends MIOObject {
    private str;
    private delegate;
    private strIndex;
    private elements;
    private attributes;
    private currentElement;
    private currentTokenValue;
    private lastTokenValue;
    initWithString(str: string, delegate: any): void;
    private nextChar();
    private prevChar();
    private readToken();
    private nextToken();
    private prevToken();
    parse(): void;
    private openTag();
    private questionMark();
    private xmlOpenTag(value);
    private xmlCloseTag();
    private beginElement(value);
    private endElement(value);
    private attribute(attr);
    private decodeAttribute(attr);
    private slash();
    private closeTag();
    private didStartElement();
    private didEndElement();
    private text(value);
    private error(expected);
}
declare class MIOOperation extends MIOObject {
    name: string;
    target: any;
    completion: any;
    private _dependencies;
    readonly dependencies: any[];
    private _isExecuting;
    readonly isExecuting: boolean;
    private setExecuting(value);
    private _isFinished;
    readonly isFinished: boolean;
    private setFinished(value);
    private _ready;
    private setReady(value);
    readonly ready: boolean;
    addDependency(operation: MIOOperation): void;
    main(): void;
    start(): void;
    executing(): boolean;
    finished(): boolean;
    observeValueForKeyPath(keyPath: string, type: string, object: any, ctx: any): void;
    private checkDependecies();
}
declare class MIOBlockOperation extends MIOOperation {
    private executionBlocks;
    static operationWithBlock(target: any, block: any): void;
    addExecutionBlock(target: any, block: any): void;
    main(): void;
}
declare class MIOOperationQueue extends MIOObject {
    private _operations;
    addOperation(operation: MIOOperation): void;
    removeOperation(operation: MIOOperation): void;
    readonly operations: any[];
    readonly operationCount: () => any;
    private _suspended;
    suspended: boolean;
    private setSupended(value);
    observeValueForKeyPath(keyPath: string, type: string, object: any, ctx: any): void;
}
declare function MIOLog(format: any): void;
declare var MIOLibIsLoaded: boolean;
declare var _MIOLibLoadedTarget: any;
declare var _MIOLibLoadedCompletion: any;
declare var _MIOLibFileIndex: number;
declare var _MIOLibFiles: any[];
declare var _mc_force_mobile: boolean;
declare enum MIOLibInitType {
    Release = 0,
    Debug = 1,
}
declare var _MIOLibMainFn: any;
declare function MIOLibInit(mainFn: any, type?: MIOLibInitType): void;
declare function MIOLibDownloadScript(url: any, target: any, completion: any): void;
declare function MIOLibLoadStyle(url: any): void;
declare function MIOLibLoadScript(url: any, callback: any): void;
declare function MIOLibLoadScriptCallback(): void;
declare function MIOLibDownloadNextFile(): void;
declare function MIOLibOnLoaded(target: any, completion: any): void;
declare function MIOLibDownloadLibFile(file: any): void;
declare function MIOLibDownloadFile(file: any): void;
declare function MIOLibIsRetina(): boolean;
declare function MIOLibDecodeParams(string: any, target?: any, completion?: any): void;
declare function MIOLibEvaluateParam(param: any, value: any, target: any, completion: any): void;
declare function _MIOLibDownloadLibFiles(): void;
declare class MIOSortDescriptor extends MIOObject {
    key: any;
    ascending: boolean;
    static sortDescriptorWithKey(key: any, ascending: any): MIOSortDescriptor;
    initWithKey(key: any, ascending: any): void;
}
declare function _MIOSortDescriptorSortObjects(objs: any, sortDescriptors: any): any;
declare function _MIOSortDescriptorSortObjects2(a: any, b: any, sortDescriptors: any, index: any): any;
