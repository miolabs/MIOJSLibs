/* Currently this file shows  
"XY has already exported a member named 'MIOCoreEvent'. Consider explicitly re-exporting to resolve the ambiguity."
error bessage, but during compilation it is not a problem, thanks to to ifdef-loader"

TODO: find a way to unify it.
*/

/// #if TARGET === 'ios'
    export * from './iOS/MIOCore_iOS'
/// #endif
/// #if TARGET === 'webapp'
    export * from './Web/MIOCore_Web'
    export * from './Web/MIOCoreBundle'
    export * from './Web/MIOCoreEvents'
/// #endif
/// #if TARGET === 'webworker'
    export * from './WebWorker/MIOCore_WebWorker'
/// #endif