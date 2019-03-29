class ViewController extends MUIViewController{
static readonly $infoAddress = '0x7fda2f82f830'
viewDidLoad($info0x7fda2f82f9e0){
let _this = this;

super.viewDidLoad({}, );
/*derived_to_base_expr*/_this.view[0].backgroundColor = _injectIntoOptional(MUIColor.red);
}
initNibNameOptionalBundleOptional($info0x7fda3329bd48, nibNameOrNil, nibBundleOrNil){
let _this = this;

super.initNibNameOptionalBundleOptional({}, nibNameOrNil, nibBundleOrNil);
return ;
}
initCoderNSCoder($info0x7fda2fc01e80, aDecoder){
let _this = this;

super.initCoderNSCoder({}, aDecoder);
return ;
}
static readonly initCoderNSCoder$failable = true

init$vars() {
if(super.init$vars)super.init$vars()
}
}

class AppDelegate /*extends MUIResponder*/ implements MUIApplicationDelegate{
static readonly $infoAddress = '0x7fda2f82fe80'

_window$internal
_window$get() { return this._window$internal }
get _window() { return this._window$get() }
_window$set($newValue) {
let $oldValue = this._window$internal
this._window$internal = $newValue
}
set _window($newValue) { this._window$set($newValue) }
;





//applicationDidFinishLaunchingWithOptions($info0x7fda30100b30, application, launchOptions){
didFinishLaunching($info0x7fda30100b30, application, launchOptions){
let _this = this;

_this._window = _injectIntoOptional(_create(MUIWindow, 'initFrameCGRect', {}, MUIScreen.main.bounds));

const vc = _create(ViewController, 'init', {}, );

;

;
_this._window[0].rootViewController = _injectIntoOptional(/*derived_to_base_expr*/vc);
_this._window[0].makeKeyAndVisible({}, );
return true;
}
applicationWillResignActive($info0x7fda301014b0, application){
let _this = this;

}
applicationDidEnterBackground($info0x7fda30101750, application){
let _this = this;

}
applicationWillEnterForeground($info0x7fda30107a18, application){
let _this = this;

}
applicationDidBecomeActive($info0x7fda30107cb8, application){
let _this = this;

}
applicationWillTerminate($info0x7fda30107f58, application){
let _this = this;

}
init($info0x7fda30418248){
let _this = this;

super.init({}, );
return ;
}

init$vars() {
if(super.init$vars)super.init$vars()
this._window$internal = Optional.none
}
}
if(typeof MUIApplicationDelegate$implementation != 'undefined') _mixin(AppDelegate, MUIApplicationDelegate$implementation, false)