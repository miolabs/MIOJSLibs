/// <reference types="miofoundation" />
declare enum MUIAnimationType {
    None = 0,
    BeginSheet = 1,
    EndSheet = 2,
    Push = 3,
    Pop = 4,
    FlipLeft = 5,
    FlipRight = 6,
    FadeIn = 7,
    FadeOut = 8,
    LightSpeedIn = 9,
    LightSpeedOut = 10,
    Hinge = 11,
    SlideInUp = 12,
    SlideOutDown = 13,
    HorizontalOutFlip = 14,
    HorizontalInFlip = 15,
}
declare function MUIClassListForAnimationType(type: any): any[];
declare function _MUIAddAnimations(layer: any, animations: any): void;
declare function _MUIRemoveAnimations(layer: any, animations: any): void;
declare function _MUIAnimationStart(layer: any, animationController: any, animationContext: any, target?: any, completion?: any): void;
declare function _MUIAnimationDidFinish(event: any): void;
declare function MUILayerSearchElementByID(layer: any, elementID: any): any;
declare function MUILayerGetFirstElementWithTag(layer: any, tag: any): any;
declare class MUIView extends MIOObject {
    layerID: any;
    layer: any;
    layerOptions: any;
    hidden: boolean;
    alpha: number;
    parent: any;
    tag: any;
    protected _viewIsVisible: boolean;
    protected _needDisplay: boolean;
    _isLayerInDOM: boolean;
    protected _subviews: any[];
    readonly subviews: any[];
    _window: MUIWindow;
    _outlets: {};
    constructor(layerID?: any);
    init(): void;
    initWithFrame(frame: any): void;
    initWithLayer(layer: any, owner: any, options?: any): void;
    copy(): any;
    awakeFromHTML(): void;
    setParent(view: any): void;
    addSubLayer(layer: any): void;
    _linkViewToSubview(view: any): void;
    addSubview(view: any, index?: any): void;
    protected _addLayerToDOM(index?: any): void;
    removeFromSuperview(): void;
    protected _removeLayerFromDOM(): void;
    private _removeAllSubviews();
    setViewIsVisible(value: boolean): void;
    layoutSubviews(): void;
    setNeedsDisplay(): void;
    layerWithItemID(itemID: any): any;
    setHidden(hidden: any): void;
    setBackgroundColor(color: any): void;
    setBackgroundRGBColor(r: any, g: any, b: any, a?: any): void;
    getBackgroundColor(): string;
    setAlpha(alpha: any, animate?: any, duration?: any): void;
    setX(x: any, animate?: any, duration?: any): void;
    getX(): number;
    setY(y: any): void;
    getY(): number;
    setWidth(w: any): void;
    getWidth(): number;
    setHeight(h: any): void;
    getHeight(): number;
    setFrameComponents(x: any, y: any, w: any, h: any): void;
    setFrame(frame: any): void;
    readonly frame: MIORect;
    readonly bounds: MIORect;
    protected _getValueFromCSSProperty(property: any): string;
    protected _getIntValueFromCSSProperty(property: any): number;
}
declare var _MUICoreLayerIDCount: number;
declare function MUICoreLayerIDFromObject(object: any): string;
declare function MUICoreLayerIDFromClassname(classname: string): string;
declare function MUICoreLayerCreate(layerID?: any): HTMLElement;
declare function MUICoreLayerCreateWithStyle(style: any, layerID?: any): HTMLElement;
declare function MUICoreLayerAddStyle(layer: any, style: any): void;
declare function MUICoreLayerRemoveStyle(layer: any, style: any): void;
declare enum MUIModalPresentationStyle {
    FullScreen = 0,
    PageSheet = 1,
    FormSheet = 2,
    CurrentContext = 3,
    Custom = 4,
    OverFullScreen = 5,
    OverCurrentContext = 6,
    Popover = 7,
    None = 8,
}
declare enum MUIModalTransitionStyle {
    CoverVertical = 0,
    FlipHorizontal = 1,
    CrossDisolve = 2,
}
declare class MUIPresentationController extends MIOObject {
    presentationStyle: MUIModalPresentationStyle;
    shouldPresentInFullscreen: boolean;
    protected _presentedViewController: MUIViewController;
    presentingViewController: any;
    presentedView: any;
    protected _transitioningDelegate: any;
    private _window;
    isPresented: boolean;
    initWithPresentedViewControllerAndPresentingViewController(presentedViewController: any, presentingViewController: any): void;
    setPresentedViewController(vc: MUIViewController): void;
    presentedViewController: MUIViewController;
    readonly transitioningDelegate: any;
    presentationTransitionWillBegin(): void;
    _calculateFrame(): void;
    presentationTransitionDidEnd(completed: any): void;
    dismissalTransitionWillBegin(): void;
    dismissalTransitionDidEnd(completed: any): void;
    window: MUIWindow;
    observeValueForKeyPath(key: any, type: any, object: any): void;
}
declare class MIOModalTransitioningDelegate extends MIOObject {
    modalTransitionStyle: any;
    private _presentAnimationController;
    private _dissmissAnimationController;
    animationControllerForPresentedController(presentedViewController: any, presentingViewController: any, sourceController: any): any;
    animationControllerForDismissedController(dismissedController: any): any;
}
declare class MIOAnimationController extends MIOObject {
    transitionDuration(transitionContext: any): number;
    animateTransition(transitionContext: any): void;
    animationEnded(transitionCompleted: any): void;
    animations(transitionContext: any): any;
}
declare class MIOModalPresentAnimationController extends MIOObject {
    transitionDuration(transitionContext: any): number;
    animateTransition(transitionContext: any): void;
    animationEnded(transitionCompleted: any): void;
    animations(transitionContext: any): any;
}
declare class MIOModalDismissAnimationController extends MIOObject {
    transitionDuration(transitionContext: any): number;
    animateTransition(transitionContext: any): void;
    animationEnded(transitionCompleted: any): void;
    animations(transitionContext: any): any;
}
declare enum MUIPopoverArrowDirection {
    Any = 0,
    Up = 1,
    Down = 2,
    Left = 3,
    Right = 4,
}
declare class MUIPopoverPresentationController extends MUIPresentationController {
    permittedArrowDirections: MUIPopoverArrowDirection;
    sourceView: any;
    sourceRect: MIORect;
    delegate: any;
    private _contentSize;
    private _canvasLayer;
    private _contentView;
    readonly transitioningDelegate: any;
    presentationTransitionWillBegin(): void;
    _calculateFrame(): void;
    private _drawRoundRect(x, y, width, height, radius);
}
declare class MIOModalPopOverTransitioningDelegate extends MIOObject {
    modalTransitionStyle: any;
    private _showAnimationController;
    private _dissmissAnimationController;
    animationControllerForPresentedController(presentedViewController: any, presentingViewController: any, sourceController: any): any;
    animationControllerForDismissedController(dismissedController: any): any;
}
declare class MIOPopOverPresentAnimationController extends MIOObject {
    transitionDuration(transitionContext: any): number;
    animateTransition(transitionContext: any): void;
    animationEnded(transitionCompleted: any): void;
    animations(transitionContext: any): any[];
}
declare class MIOPopOverDismissAnimationController extends MIOObject {
    transitionDuration(transitionContext: any): number;
    animateTransition(transitionContext: any): void;
    animationEnded(transitionCompleted: any): void;
    animations(transitionContext: any): any[];
}
declare class MUIWindow extends MUIView {
    rootViewController: MUIViewController;
    private _resizeWindow;
    initWithRootViewController(vc: any): void;
    makeKey(): void;
    makeKeyAndVisible(): void;
    layoutSubviews(): void;
    addSubview(view: MUIView): void;
    protected _addLayerToDOM(): void;
    removeFromSuperview(): void;
    protected _removeLayerFromDOM(): void;
    setHidden(hidden: any): void;
    _eventHappendOutsideWindow(): void;
    _becameKeyWindow(): void;
    _resignKeyWindow(): void;
    private _dismissRootViewController();
}
declare class MUIViewController extends MIOObject {
    layerID: string;
    view: MUIView;
    private _htmlResourcePath;
    private _onViewLoadedTarget;
    private _onViewLoadedAction;
    private _onLoadLayerTarget;
    private _onLoadLayerAction;
    private _viewIsLoaded;
    private _layerIsReady;
    private _childViewControllers;
    parentViewController: any;
    presentingViewController: any;
    presentedViewController: any;
    navigationController: MUINavigationController;
    splitViewController: any;
    tabBarController: any;
    private _presentationController;
    private _popoverPresentationController;
    modalPresentationStyle: MUIModalPresentationStyle;
    modalTransitionStyle: MUIModalTransitionStyle;
    transitioningDelegate: any;
    protected _contentSize: MIOSize;
    protected _preferredContentSize: any;
    _outlets: {};
    constructor(layerID?: any);
    init(): void;
    initWithLayer(layer: any, owner: any, options?: any): void;
    initWithResource(path: any): void;
    localizeSubLayers(layers: any): void;
    localizeLayerIDWithKey(layerID: any, key: any): void;
    loadView(): void;
    _didLoadView(): void;
    protected _loadChildControllers(): void;
    protected _loadChildViewController(index: any, max: any): void;
    protected _setViewLoaded(value: any): void;
    onLoadView(target: any, action: any): void;
    onLoadLayer(target: any, action: any): void;
    readonly viewIsLoaded: boolean;
    readonly childViewControllers: any[];
    addChildViewController(vc: any): void;
    removeChildViewController(vc: any): void;
    readonly isPresented: boolean;
    readonly presentationController: any;
    readonly popoverPresentationController: MUIPopoverPresentationController;
    showViewController(vc: any, animate: any): void;
    presentViewController(vc: MUIViewController, animate: boolean): void;
    dismissViewController(animate: any): void;
    transitionFromViewControllerToViewController(fromVC: any, toVC: any, duration: any, animationType: any, target?: any, completion?: any): void;
    viewDidLoad(): void;
    viewWillAppear(animated?: any): void;
    viewDidAppear(animated?: any): void;
    viewWillDisappear(animated?: any): void;
    viewDidDisappear(animated?: any): void;
    contentHeight(): number;
    setContentSize(size: any): void;
    contentSize: MIOSize;
    preferredContentSize: any;
}
interface Window {
    prototype: any;
}
declare function MUIOutletRegister(owner: any, layerID: any, c: any): void;
declare function MUIOutletQuery(owner: any, layerID: any): any;
declare function MUIOutlet(owner: any, elementID: any, className?: any, options?: any): any;
declare function MUIWindowSize(): MIOSize;
declare function _MIUShowViewController(fromVC: any, toVC: any, sourceVC: any, target?: any, completion?: any): void;
declare function _MUIHideViewController(fromVC: any, toVC: any, sourceVC: any, target?: any, completion?: any): void;
declare function _MUITransitionFromViewControllerToViewController(fromVC: any, toVC: any, sourceVC: any, target?: any, completion?: any): void;
declare class MUIControl extends MUIView {
    enabled: boolean;
    mouseOverTarget: any;
    mouseOverAction: any;
    mouseOutTarget: any;
    mouseOutAction: any;
    setEnabled(enabled: any): void;
    setOnMouseOverAction(target: any, action: any): void;
    setOnMouseOutAction(target: any, action: any): void;
}
declare enum MUIButtonType {
    MomentaryPushIn = 0,
    PushOnPushOff = 1,
    PushIn = 2,
}
declare class MUIButton extends MUIControl {
    private _statusStyle;
    private _titleStatusStyle;
    private _titleLayer;
    private _imageStatusStyle;
    private _imageLayer;
    target: any;
    action: any;
    private _selected;
    type: MUIButtonType;
    initWithLayer(layer: any, owner: any, options?: any): void;
    initWithAction(target: any, action: any): void;
    setAction(target: any, action: any): void;
    setTitle(title: any): void;
    title: any;
    readonly selected: boolean;
    setSelected(value: any): void;
}
declare class MUITabBarItem extends MUIButton {
}
declare class MUITabBar extends MUIView {
    items: any[];
    selectedTabBarItemIndex: number;
    private _itemsByIdentifier;
    initWithLayer(layer: any, owner: any, options?: any): void;
    private _addTabBarItem(item);
    addTabBarItem(item: any): void;
    selectTabBarItem(item: any): void;
    selectTabBarItemAtIndex(index: any): void;
    layout(): void;
}
declare class MUIImageView extends MUIView {
    private _imageLayer;
    initWithLayer(layer: any, owner: any, options?: any): void;
    setImage(imageURL: any): void;
}
declare class MUILabel extends MUIView {
    private _textLayer;
    autoAdjustFontSize: string;
    autoAdjustFontSizeValue: number;
    init(): void;
    initWithLayer(layer: any, owner: any, options?: any): void;
    private _setupLayer();
    setText(text: any): void;
    text: any;
    setTextAlignment(alignment: any): void;
    setHightlighted(value: any): void;
    setTextRGBColor(r: any, g: any, b: any): void;
    setFontSize(size: any): void;
    setFontStyle(style: any): void;
    setFontFamily(fontFamily: any): void;
}
declare enum MUITextFieldType {
    NormalType = 0,
    PasswordType = 1,
    SearchType = 2,
}
declare class MUITextField extends MUIControl {
    placeHolder: any;
    private _inputLayer;
    type: MUITextFieldType;
    textChangeTarget: any;
    textChangeAction: any;
    private _textChangeFn;
    enterPressTarget: any;
    enterPressAction: any;
    keyPressTarget: any;
    keyPressAction: any;
    formatter: MIOFormatter;
    init(): void;
    initWithLayer(layer: any, owner: any, options?: any): void;
    private _setupLayer();
    layoutSubviews(): void;
    setText(text: any): void;
    text: any;
    setPlaceholderText(text: any): void;
    setOnChangeText(target: any, action: any): void;
    private _registerInputEvent();
    private _unregisterInputEvent();
    private _textDidChange();
    private _textDidChangeDelegate(value);
    setOnEnterPress(target: any, action: any): void;
    setOnKeyPress(target: any, action: any): void;
    private didEditingAction;
    private didEditingTarget;
    setOnDidEditing(target: any, action: any): void;
    setTextRGBColor(r: any, g: any, b: any): void;
    textColor: string;
    becomeFirstResponder(): void;
}
declare class MUITextArea extends MUIControl {
    textareaLayer: any;
    textChangeTarget: any;
    textChangeAction: any;
    initWithLayer(layer: any, owner: any, options?: any): void;
    text: any;
    setText(text: any): void;
    getText(): any;
    setEditMode(value: any): void;
    setOnChangeText(target: any, action: any): void;
}
declare class MUIScrollView extends MUIView {
    pagingEnabled: boolean;
    delegate: any;
    scrolling: boolean;
    private _showsVerticalScrollIndicator;
    showsVerticalScrollIndicator: boolean;
    private _scrollEnable;
    scrollEnable: boolean;
    private scrollTimer;
    private lastOffsetY;
    protected contentView: any;
    init(): void;
    initWithLayer(layer: any, owner: any, options?: any): void;
    private setupLayer();
    private scrollEventCallback(event);
    private scrollEventStopCallback(timer);
    protected didStartScroll(): void;
    protected didScroll(deltaX: any, deltaY: any): void;
    protected didStopScroll(): void;
    setScrollEnable(value: boolean): void;
    setShowsVerticalScrollIndicator(value: boolean): void;
    contentOffset: MIOPoint;
    readonly bounds: MIORect;
    addSubview(view: MUIView, index?: any): void;
    contentSize: MIOSize;
    layoutSubviews(): void;
    scrollToTop(animate?: any): void;
    scrollToBottom(animate?: any): void;
    scrollToPoint(x: any, y: any, animate?: any): void;
    scrollRectToVisible(rect: any, animate?: any): void;
}
declare enum MUITableViewCellStyle {
    Custom = 0,
    Default = 1,
}
declare enum MUITableViewCellAccessoryType {
    None = 0,
    DisclosureIndicator = 1,
    DetailDisclosureButton = 2,
    Checkmark = 3,
}
declare enum MIOTableViewCellEditingStyle {
    None = 0,
    Delete = 1,
    Insert = 2,
}
declare enum MUITableViewCellSeparatorStyle {
    None = 0,
    SingleLine = 1,
    SingleLineEtched = 2,
}
declare enum MUITableViewCellSelectionStyle {
    None = 0,
    Default = 1,
}
declare class MUITableViewCell extends MUIView {
    reuseIdentifier: string;
    nodeID: string;
    contentView: MUIView;
    style: MUITableViewCellStyle;
    textLabel: any;
    accessoryType: MUITableViewCellAccessoryType;
    accessoryView: any;
    separatorStyle: MUITableViewCellSeparatorStyle;
    selectionStyle: MUITableViewCellSelectionStyle;
    private _selected;
    private _editing;
    editingAccessoryType: MUITableViewCellAccessoryType;
    editingAccesoryView: MUIView;
    private _target;
    private _onClickFn;
    private _onDblClickFn;
    private _onAccessoryClickFn;
    private _row;
    private _section;
    initWithStyle(style: MUITableViewCellStyle): void;
    initWithLayer(layer: any, owner: any, options: any): void;
    private _setupLayer();
    setAccessoryType(type: any): void;
    setPaddingIndex(value: any): void;
    setHeight(h: any): void;
    setSelected(value: any): void;
    selected: boolean;
    _setHightlightedSubviews(value: any): void;
    setEditing(editing: any, animated?: any): void;
    editing: boolean;
    readonly isEditing: boolean;
}
interface MUITableViewDataSource {
    viewForHeaderInSection?(tableView: MUITableView, section: any): MUIView;
    titleForHeaderInSection?(tableView: MUITableView, section: any): string;
}
declare class MUITableViewSection extends MIOObject {
    header: MUIView;
    title: String;
    rows: number;
    cells: any[];
    static headerWithTitle(title: any, height: any): MUIView;
}
declare enum MUITableViewRowType {
    Header = 0,
    SectionHeader = 1,
    Cell = 2,
    SectionFooter = 3,
    Footer = 4,
}
declare class MUITableViewRow extends MIOObject {
    type: MUITableViewRowType;
    view: MUIView;
    height: number;
    initWithType(type: MUITableViewRowType): void;
}
declare class MUITableViewCellNode extends MIOObject {
    identifier: String;
    section: MUITableViewSection;
}
declare class MUITableView extends MUIScrollView {
    dataSource: any;
    delegate: any;
    headerView: MUIView;
    footerView: MUIView;
    headerHeight: number;
    footerHeight: number;
    sectionHeaderHeight: number;
    sectionFooterHeight: number;
    rowHeight: number;
    private defaultRowHeight;
    allowsMultipleSelection: boolean;
    private selectedIndexPath;
    private _indexPathsForSelectedRows;
    private _cellPrototypesCount;
    private _cellPrototypesDownloadedCount;
    private _isDownloadingCells;
    private _needReloadData;
    private _cellPrototypes;
    private reusableCellsByID;
    private visibleCells;
    private cellNodesByID;
    private visibleRange;
    private sections;
    private rows;
    private rowsCount;
    private contentHeight;
    private lastContentOffsetY;
    private firstVisibleHeader;
    initWithLayer(layer: any, owner: any, options?: any): void;
    private _addHeaderWithLayer(subLayer, owner);
    private _addFooterWithLayer(subLayer, owner);
    private _addCellPrototypeWithLayer(subLayer, owner);
    addCellPrototypeWithIdentifier(identifier: any, elementID: any, url: any, classname?: any): void;
    dequeueReusableCellWithIdentifier(identifier: any): MUITableViewCell;
    setHeaderView(view: any): void;
    reloadData(): void;
    private reloadLayoutSubviews;
    layoutSubviews(): void;
    private lastIndexPath;
    private initialLayoutSubviews();
    private scrollLayoutSubviews();
    private recycleCell(cell);
    private indexPathForRowIndex(index, sectionIndex);
    private addRowsForNewVisibleRange(range, scrollDown);
    private addRowWithType(type, view);
    private addHeader();
    private addSectionHeader(section, posY, row);
    private addCell(indexPath, posY, row, previusCell?);
    private addSectionFooter(section, posY, rowIndex);
    private addFooter();
    cellOnClickFn(cell: MUITableViewCell): void;
    cellOnDblClickFn(cell: any): void;
    cellOnAccessoryClickFn(cell: any): void;
    cellAtIndexPath(indexPath: MIOIndexPath): any;
    indexPathForCell(cell: MUITableViewCell): MIOIndexPath;
    _selectCell(cell: any): void;
    selectCellAtIndexPath(indexPath: MIOIndexPath): void;
    _deselectCell(cell: any): void;
    deselectCellAtIndexPath(indexPath: MIOIndexPath): void;
    selectNextIndexPath(): void;
    selectPrevIndexPath(): void;
}
declare function MIOEdgeInsetsMake(top: any, left: any, bottom: any, rigth: any): MUIEdgeInsets;
declare class MUIEdgeInsets extends MIOObject {
    top: number;
    left: number;
    bottom: number;
    right: number;
    static Zero(): MUIEdgeInsets;
    initWithValues(top: any, left: any, bottom: any, right: any): void;
}
declare class MUICollectionViewLayout extends MIOObject {
    collectionView: MUICollectionView;
    minimumLineSpacing: number;
    minimumInteritemSpacing: number;
    itemSize: MIOSize;
    estimatedItemSize: MIOSize;
    sectionInset: MUIEdgeInsets;
    headerReferenceSize: MIOSize;
    footerReferenceSize: MIOSize;
    init(): void;
    invalidateLayout(): void;
}
declare class MUICollectionViewFlowLayout extends MUICollectionViewLayout {
    init(): void;
}
declare class MUICollectionViewCell extends MUIView {
    _target: any;
    _onClickFn: any;
    _index: any;
    _section: any;
    selected: boolean;
    initWithLayer(layer: any, owner: any, options: any): void;
    private _setupLayer();
    setSelected(value: any): void;
}
declare class MUICollectionViewSection extends MIOObject {
    header: any;
    footer: any;
    cells: any[];
}
declare class MUICollectionView extends MUIView {
    dataSource: any;
    delegate: any;
    private _collectionViewLayout;
    private _cellPrototypes;
    private _supplementaryViews;
    private _sections;
    selectedCellIndex: number;
    selectedCellSection: number;
    collectionViewLayout: MUICollectionViewFlowLayout;
    initWithLayer(layer: any, options: any): void;
    private _addCellPrototypeWithLayer(subLayer);
    private _addSupplementaryViewPrototypeWithLayer(subLayer);
    registerClassForCellWithReuseIdentifier(cellClass: any, resource: any, identifier: any): void;
    registerClassForSupplementaryViewWithReuseIdentifier(viewClass: any, resource: any, identifier: any): void;
    dequeueReusableCellWithIdentifier(identifier: any): any;
    dequeueReusableSupplementaryViewWithReuseIdentifier(identifier: any): any;
    cellAtIndexPath(indexPath: MIOIndexPath): any;
    reloadData(): void;
    cellOnClickFn(cell: any): void;
    _selectCell(cell: any): void;
    selectCellAtIndexPath(index: any, section: any): void;
    _deselectCell(cell: any): void;
    deselectCellAtIndexPath(indexPath: MIOIndexPath): void;
    layoutSubviews(): void;
}
declare class MUIWebView extends MUIView {
    private _iframeLayer;
    init(): void;
    initWithLayer(layer: any, owner: any, options?: any): void;
    private _setupLayer();
    setURL(url: any): void;
    setHTML(html: any): void;
}
declare class MUICheckButton extends MUIControl {
    target: any;
    action: any;
    on: boolean;
    initWithLayer(layer: any, owner: any, options?: any): void;
    setOnChangeValue(target: any, action: any): void;
    setOn(on: any): void;
    toggleValue(): void;
}
declare class MUISwitchButton extends MUIControl {
    target: any;
    action: any;
    on: boolean;
    private _inputLayer;
    private _labelLayer;
    initWithLayer(layer: any, owner: any, options?: any): void;
    setOnChangeValue(target: any, action: any): void;
    setOn(on: any): void;
    private _toggleValue();
}
declare class MUIWebApplication {
    private static _sharedInstance;
    static sharedInstance(): MUIWebApplication;
    private constructor();
    delegate: any;
    isMobile: boolean;
    defaultLanguage: any;
    currentLanguage: any;
    languages: any;
    ready: boolean;
    private downloadCoreFileCount;
    private _sheetViewController;
    private _sheetSize;
    private _popUpMenu;
    private _popUpMenuControl;
    private _popOverWindow;
    private _popOverWindowFirstClick;
    private _popOverViewController;
    private _windows;
    private _keyWindow;
    private _mainWindow;
    run(): void;
    private _run();
    setLanguageURL(key: any, url: any): void;
    setDefaultLanguage(key: any): void;
    downloadLanguage(key: any, fn: any): void;
    showModalViewContoller(vc: any): void;
    showMenuFromControl(control: any, menu: any): void;
    hideMenu(): void;
    private _resizeEvent(event);
    private _clickEvent(event);
    setPopOverViewController(vc: any): void;
    showPopOverControllerFromRect(vc: any, frame: any): void;
    hidePopOverController(): void;
    addWindow(window: any): void;
    makeKeyWindow(window: any): void;
}
declare class MUIMenuItem extends MUIView {
    checked: boolean;
    title: any;
    private _titleLayer;
    target: any;
    action: any;
    static itemWithTitle(title: any): MUIMenuItem;
    initWithTitle(title: any): void;
    _setupLayer(): void;
    getWidth(): any;
    getHeight(): any;
}
declare class MUIMenu extends MUIView {
    items: any[];
    private _isVisible;
    private _updateWidth;
    target: any;
    action: any;
    private _menuLayer;
    init(): void;
    _setupLayer(): void;
    private _addMenuItem(menuItem);
    addMenuItem(menuItem: any): void;
    removeMenuItem(menuItem: any): void;
    private _menuItemDidClick(menuItem);
    showFromControl(control: any): void;
    hide(): void;
    readonly isVisible: boolean;
    layout(): void;
}
declare class MUIPopUpButton extends MUIButton {
    private _menu;
    private _isVisible;
    initWithLayer(layer: any, owner: any, options?: any): void;
    setMenuAction(target: any, action: any): void;
    addMenuItemWithTitle(title: any): void;
}
declare class MUIComboBox extends MUIControl {
    private _selectLayer;
    target: any;
    action: any;
    init(): void;
    initWithLayer(layer: any, owner: any, options?: any): void;
    private _setup_layers();
    setAllowMultipleSelection(value: any): void;
    layoutSubviews(): void;
    addItem(text: any, value?: any): void;
    addItems(items: any): void;
    removeAllItems(): void;
    getItemAtIndex(index: any): any;
    getSelectedItem(): any;
    getSelectedItemText(): any;
    selectItem(item: any): void;
    setOnChangeAction(target: any, action: any): void;
}
declare class MUISegmentedControl extends MUIControl {
    segmentedItems: any[];
    selectedSegmentedIndex: number;
    initWithLayer(layer: any, owner: any, options?: any): void;
    private _addSegmentedItem(item);
    private _didClickSegmentedButton(button);
    setAction(target: any, action: any): void;
    selectSegmentedAtIndex(index: any): void;
}
declare class MUIPageControl extends MUIControl {
    numberOfPages: number;
    private _items;
    private _currentPage;
    initWithLayer(layer: any, owner: any, options?: any): void;
    currentPage: number;
}
declare class MUIToolbarButton extends MUIButton {
    static buttonWithLayer(layer: any, owner: any): MUIToolbarButton;
}
declare class MUIToolbar extends MUIView {
    buttons: any[];
    initWithLayer(layer: any, owner: any, options?: any): void;
    addToolbarButton(button: any): void;
}
declare class MUINavigationController extends MUIViewController {
    rootViewController: any;
    viewControllersStack: any[];
    currentViewControllerIndex: number;
    init(): void;
    initWithRootViewController(vc: any): void;
    setRootViewController(vc: any): void;
    viewWillAppear(animated?: any): void;
    viewDidAppear(animated?: any): void;
    viewWillDisappear(animated?: any): void;
    viewDidDisappear(animated?: any): void;
    pushViewController(vc: any, animated?: any): void;
    popViewController(animated?: any): void;
    popToRootViewController(animated?: any): void;
    readonly preferredContentSize: any;
    private _pushAnimationController;
    private _popAnimationController;
    animationControllerForPresentedController(presentedViewController: any, presentingViewController: any, sourceController: any): any;
    animationControllerForDismissedController(dismissedController: any): any;
}
declare class MUIPushAnimationController extends MIOObject {
    transitionDuration(transitionContext: any): number;
    animateTransition(transitionContext: any): void;
    animationEnded(transitionCompleted: any): void;
    animations(transitionContext: any): any[];
}
declare class MUIPopAnimationController extends MIOObject {
    transitionDuration(transitionContext: any): number;
    animateTransition(transitionContext: any): void;
    animationEnded(transitionCompleted: any): void;
    animations(transitionContext: any): any[];
}
declare class MUIPageController extends MUIViewController {
    selectedViewControllerIndex: number;
    pageControllersCount: number;
    addPageViewController(vc: any): void;
    protected _loadChildControllers(): void;
    viewWillAppear(animated?: any): void;
    viewDidAppear(animated?: any): void;
    viewWillDisappear(animated?: any): void;
    viewDidDisappear(animated?: any): void;
    showPageAtIndex(index: any): void;
    showNextPage(): void;
    showPrevPage(): void;
    private _pageAnimationController;
    animationControllerForPresentedController(presentedViewController: any, presentingViewController: any, sourceController: any): any;
    animationControllerForDismissedController(dismissedController: any): any;
}
declare class MIOPageAnimationController extends MIOObject {
    transitionDuration(transitionContext: any): number;
    animateTransition(transitionContext: any): void;
    animationEnded(transitionCompleted: any): void;
    animations(transitionContext: any): any;
}
declare class MUISplitViewController extends MUIViewController {
    private _masterViewController;
    private _detailViewController;
    private _masterView;
    private _detailView;
    init(): void;
    setMasterViewController(vc: any): void;
    setDetailViewController(vc: any): void;
    showDetailViewController(vc: any): void;
    readonly masterViewController: any;
    readonly detailViewController: any;
}
declare class MIOTabBarController extends MUIViewController {
    tabBar: any;
    private pageController;
    viewDidLoad(): void;
    addTabBarViewController(vc: any): void;
}
declare enum MUIAlertViewStyle {
    Default = 0,
}
declare enum MUIAlertActionStyle {
    Default = 0,
    Cancel = 1,
    Destructive = 2,
}
declare enum MUIAlertItemType {
    None = 0,
    Action = 1,
    TextField = 2,
    ComboBox = 3,
}
declare class MUIAlertItem extends MIOObject {
    type: MUIAlertItemType;
    initWithType(type: MUIAlertItemType): void;
}
declare class MUIAlertTextField extends MUIAlertItem {
    textField: MUITextField;
    initWithConfigurationHandler(target: any, handler: any): void;
}
declare class MUIAlertComboBox extends MUIAlertItem {
    comboBox: MUIComboBox;
    initWithConfigurationHandler(target: any, handler: any): void;
}
declare class MUIAlertAction extends MUIAlertItem {
    title: any;
    style: MUIAlertActionStyle;
    target: any;
    completion: any;
    static alertActionWithTitle(title: string, style: MUIAlertActionStyle, target: any, completion: any): MUIAlertAction;
    initWithTitle(title: any, style: any): void;
}
declare class MUIAlertViewController extends MUIViewController {
    textFields: any[];
    comboBoxes: any[];
    private target;
    private completion;
    private _items;
    private _title;
    private _message;
    private _style;
    private _backgroundView;
    private _tableView;
    private _headerCell;
    private _alertViewSize;
    initWithTitle(title: string, message: string, style: MUIAlertViewStyle): void;
    viewDidLoad(): void;
    viewDidAppear(animated?: any): void;
    viewWillDisappear(animated?: any): void;
    readonly preferredContentSize: MIOSize;
    private _addItem(item);
    addAction(action: MUIAlertAction): void;
    addTextFieldWithConfigurationHandler(target: any, handler: any): void;
    addComboBoxWithConfigurationHandler(target: any, handler: any): void;
    addCompletionHandler(target: any, handler: any): void;
    private _calculateContentSize();
    numberOfSections(tableview: any): number;
    numberOfRowsInSection(tableview: any, section: any): number;
    cellAtIndexPath(tableview: any, indexPath: MIOIndexPath): MUITableViewCell;
    heightForRowAtIndexPath(tableView: MUITableView, indexPath: MIOIndexPath): number;
    canSelectCellAtIndexPath(tableview: any, indexPath: MIOIndexPath): boolean;
    didSelectCellAtIndexPath(tableView: any, indexPath: MIOIndexPath): void;
    private _createHeaderCell();
    private _createActionCellWithTitle(title, style);
    private _createTextFieldCell(textField);
    private _createComboBoxCell(comboBox);
    private _fadeInAnimationController;
    private _fadeOutAnimationController;
    animationControllerForPresentedController(presentedViewController: any, presentingViewController: any, sourceController: any): any;
    animationControllerForDismissedController(dismissedController: any): any;
}
declare class MUIAlertFadeInAnimationController extends MIOObject {
    transitionDuration(transitionContext: any): number;
    animateTransition(transitionContext: any): void;
    animationEnded(transitionCompleted: any): void;
    animations(transitionContext: any): any[];
}
declare class MUIAlertFadeOutAnimationController extends MIOObject {
    transitionDuration(transitionContext: any): number;
    animateTransition(transitionContext: any): void;
    animationEnded(transitionCompleted: any): void;
    animations(transitionContext: any): any[];
}
declare enum MUICalendarDayCellType {
    Default = 0,
    Custom = 1,
}
declare class MUICalendarDayCell extends MUIView {
    type: MUICalendarDayCellType;
    identifier: any;
    weekRow: number;
    private _date;
    readonly date: Date;
    private _day;
    private _month;
    private _year;
    private _titleLabel;
    private _selected;
    selected: boolean;
    private _isToday;
    init(): void;
    initWithLayer(layer: any, owner: any, options?: any): void;
    private _setupLayer();
    private _onClick();
    setDate(date: Date): void;
    setToday(value: boolean): void;
    setSelected(value: boolean): void;
}
declare class MUICalendarMonthView extends MUIView {
    private _month;
    readonly month: any;
    private _year;
    readonly year: any;
    firstDate: any;
    lastDate: any;
    cellSpacingX: number;
    cellSpacingY: number;
    private _header;
    private _headerTitleLabel;
    private _dayViews;
    private _dayViewIndex;
    private _weekRows;
    private _delegate;
    initWithMonth(month: any, year: any, delegate: any): void;
    setMonth(month: any, year: any): void;
    private _setupHeader();
    private _dayCellAtDate(date);
    private _setupDays();
    layoutSubviews(): void;
}
declare class MUICalendarView extends MUIScrollView {
    dataSource: any;
    delegate: any;
    minDate: Date;
    maxDate: Date;
    horizontalCellSpacing: number;
    verticalCellSpacing: number;
    selectedDate: any;
    private _selectedDayCell;
    private _today;
    readonly today: Date;
    private _currentMonth;
    private _cellPrototypes;
    private _reusablePrototypeDayCells;
    private _reusableDayCells;
    private _views;
    private _visibleDayCells;
    private scrollTopLimit;
    private scrollBottomLimit;
    init(): void;
    initWithLayer(layer: any, owner: any, options?: any): void;
    private _setup();
    private _addCellPrototypeWithLayer(subLayer);
    _reuseDayCell(cell: any, identifier?: string): void;
    private _cellDayAtDate(date);
    cellDayAtDate(date: any): any;
    dequeueReusableDayCellWithIdentifier(identifier?: string): any;
    reloadData(): void;
    private initialReload;
    layoutSubviews(): void;
    private initialLayout();
    private lastContentOffsetY;
    private scrollLayout();
    observeValueForKeyPath(key: any, type: any, object: any): void;
    private _didChangeDayCellSelectedValue(dayCell);
    scrollToDate(date: Date): void;
    deselectCellAtDate(date: Date): void;
}
declare function MIOCalendarGetStringFromDate(date: any): string;
declare class MUIDatePickerController extends MUIViewController {
    delegate: any;
    private calendarView;
    viewDidLoad(): void;
    viewTitleForHeaderAtMonthForCalendar(calendar: any, currentMonth: any): MUILabel;
    dayCellAtDate(calendar: any, date: any): any;
    didSelectDayCellAtDate(calendarView: any, date: any): void;
    readonly preferredContentSize: MIOSize;
}
declare enum MUIChartViewType {
    Bar = 0,
    HorizontalBar = 1,
    Line = 2,
    Pie = 3,
}
declare class MUIChartView extends MUIView {
    title: string;
    backgroundChartColors: string[];
    borderChartColors: string[];
    labels: any;
    values: any;
    private canvas;
    private chartLayer;
    initWithLayer(layer: any, owner: any, options?: any): void;
    private createCanvas();
    private destroyCanvas();
    renderWithType(type: MUIChartViewType): void;
    clear(): void;
    private nameFromChartType(type);
    private optionsForChartType(type, title);
}
declare class MUIReportViewController extends MUIViewController {
    private _tableView;
}
declare enum MUIReportTableViewCellType {
    Custom = 0,
    Label = 1,
    Combox = 2,
}
declare class MUIReportTableViewCell extends MUIView {
    type: MUIReportTableViewCellType;
    label: MUILabel;
    private _target;
    private _onClickFn;
    private parentRow;
    initWithLayer(layer: any, owner: any, options: any): void;
}
declare class MUIReportTableViewRow extends MUIView {
    cells: any[];
    removeFromSuperview(): void;
}
declare class MUIReportTableViewColumn extends MIOObject {
    static labelColumnWithTitle(title: string, width: any, minWidth: any, alignment: any, key?: any, formatter?: MIOFormatter, identifer?: string): MUIReportTableViewColumn;
    identifier: string;
    title: string;
    width: number;
    minWidth: number;
    serverName: string;
    pixelWidth: number;
    alignment: string;
    formatter: MIOFormatter;
    ascending: boolean;
    private _colHeader;
    _target: any;
    _onHeaderClickFn: any;
    columnHeaderView(): MUIView;
}
declare class MUIReportTableView extends MUIView {
    dataSource: any;
    delegate: any;
    private cellPrototypes;
    private cells;
    private rows;
    columns: any[];
    private rowByCell;
    selectedIndexPath: any;
    initWithLayer(layer: any, owner: any, options?: any): void;
    private _addCellPrototypeWithLayer(subLayer);
    addColumn(column: MUIReportTableViewColumn): void;
    removeAllColumns(): void;
    dequeueReusableCellWithIdentifier(identifier: string): any;
    reloadData(): void;
    layoutSubviews(): void;
    onHeaderClickFn(col: MUIReportTableViewColumn): void;
    cellOnClickFn(cell: any): void;
}
declare class MUIActivityIndicator extends MUIView {
}
