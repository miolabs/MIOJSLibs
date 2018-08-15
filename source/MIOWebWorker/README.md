# Webworkers

This folder contains the different webworkers that can be started from the framework.
Each webworker is built separately, with their own configuration files.

## Build webworkers

You can build all webworkers at once with the folllowing command, from any directory. (It will load the corresponding script from the root `package.json` file)

```bash
npm run build:webworkers
```

This script loads a shell script which:

1. walks through all subfolders of `this` folder
1. tries to run webpack in the actual folder (which loads `webpack.config.js` by default)
1. finishes the build without errors, errors are shown as warnings. Some errors might be misleading. see below.

## Notes

### Default configs

This config file only contains information about the certain webworker, it loads the common configuration (`webpack.config.common.js`) from its parent directory.

### Awesome-webpack-loader

Currently awesome-typescript-loader is used to build the modules. The main reason over `ts-loader` is it can emit errors as warnings, so it does not stop the compilation on an error. It can supress warning messages from files, which is useful, because we use `ifdef-loader` to exclude platform dependent parts of the code. First all files are processed by `ifdef-loader`, after that the files are compiled by `awesome-ts-loader`.

I have supressed the errors from the other platforms with [minimatch](https://github.com/isaacs/minimatch) glob patterns:

```js
    reportFiles: [
        '!../../(Web|iOS)/*.ts',
    ]
```

Beware that `awesome-typescript-loader` strips certain type informations, for example interfaces. 
If you want full typing information for the webworkers consider `ts-loader`, if you run into errors during typing concatenation.

### Misleading errors

Somehow if you import/use a function from a file which contains reference to any thing that is [not accessible from webworkers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers), you will probably get a warning, regardless the fact that it has been correctly excluded by `ifdef-loader`, it seems like type checking is not using the files provided by the loader stream.

```plaintext
WARNING in [at-loader] ../../../MIOFoundation/MIOURLConnection.ts:70:40
    TS2304: Cannot find name 'window'.
```

So it does not matter to it if you have excluded the 70th line, if you use that function, that contains that line.

### Do not import barrels

In order to avoid misleading errors I advise you to use exact imports from the files instead of the barrels from the modules' `index.ts` files.


```typescript
//Use this
import { MIOURL} from "../../../MIOFoundation/MIOURL";
import { MIOURLConnection } from "../../../MIOFoundation/MIOURLConnection"
//Instead of this
import { MIOURL, MIOURLConnection} from "../../../MIOFoundation";
```