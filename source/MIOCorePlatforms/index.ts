/// #if TARGET === 'ios'
    export * from './iOS/MIOCore_iOS'
/// #endif
/// #if TARGET === 'webapp'
    export * from './Web/MIOCore_Web'
/// #endif

/*
Currently, if two platforms have the same name for a module ts will complain about reexporting the same modules.

I propose a solution for multiple platforms with interfaces, the exported functionality should be encapsulated in a class that implements a base interface

```typescript
let MIOCorePlatform:any;

/// #if TARGET === 'ios'
    import { MIOIOSPlatform } from "./iOS";
    MIOCorePlatform = MIOIOSPlatform;
/// #endif
/// #if TARGET === 'web'
    import { MIOWEBPlatform } from "./Web";
    MIOCorePlatform = MIOWEBPlatform;
/// #endif

export { MIOCorePlatform };
```

In the code it can be used like this, to get type information of the interface:

```typescript
import {MIOCorePlatform} from '../MIOCorePlatforms'
const platform:MIOCorePlatform = MIOCorePlatform;
```
*/