/* Currently this file has  
"XY has already exported a member named 'MIOCoreEvent'. Consider explicitly re-exporting to resolve the ambiguity."
error bessage, but during compilation it is not a problem, thanks to to ifdef-loader"

But it is supressed with `// @ts-ignore`.
*/

/// #if TARGET === 'ios'
    // export * from './iOS/MIOCore_iOS'
/// #endif
/// #if TARGET === 'webapp'
    export * from './MIOCore_Web'
    export * from './MIOCoreBundle'
    export * from './MIOCoreEvents'
    export * from './MIOHTTPRequest'
/// #endif
/// #if TARGET === 'node'
    // @ts-ignore: ifdef loader takes care of it
    // export * from './Node/MIOCore'
    // @ts-ignore: ifdef loader takes care of it
    // export * from './Node/MIOHTTPRequest'
/// #endif
/// #if TARGET === 'webworker'
    // @ts-ignore: ifdef loader takes care of it
    // export * from './WebWorker/MIOCore_WebWorker'
/// #endif