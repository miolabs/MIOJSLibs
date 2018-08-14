# Build the project

- [Build the project](#build-the-project)
    - [Getting started](#getting-started)
    - [For development](#for-development)
    - [Under the hood](#under-the-hood)
        - [Libs](#libs)
        - [Typing](#typing)
        - [Web workers](#web-workers)
        - [Multiple platform](#multiple-platform)

## Getting started

In order to build this project you'll need:

* [nodejs](https://nodejs.org/en/download/)
* [python3](https://www.python.org/downloads/)
* `npm install`: in this project directory to get the dependencies from `package.json`.

Now you can run `npm run prod` to get the bundled distributable version of the libs.

## For development

```bash
#rebuild the base libs and typings.
npm run build:libs
npm run build:typings
#run this in case you've modified the webworkers
npm run build:webworkers
```

> Currently the build pipeline does not allow watched rebuilds. Webpack is capable of it.
> The current problem is that typings have to be rebuilt after changes, but can not inspect the end of the build (or lead to constant rebuild after changes) to start the typing bundling. It is less error-prone this way.

## Under the hood

This project uses [webpack](https://webpack.js.org/)
to create the bundled sources from the [typescript](https://www.typescriptlang.org/) sources.

### Libs

The libraries are built with webpack. The configuration files can be found in the project root folder.
The ts-compilation is done by [ts-loader](https://github.com/TypeStrong/ts-loader) (awesome-ts-loader has some issues around typing generation).

```bash
npm run build:libs
```

The generated file's `first line` will be marked with the **generation date** and the **version number** set in package.json in the time of building.

If `NODE_ENV` environmental variable is set to `prod` during the built, then the code will be **minified** and **sourcemaps are not generated**.

### Typing

The library currently exposes its functions to the global scope to be available for the project that uses this project. If that project uses typescript, it has to know what are the types that can be used. Typescript can generate typings, but currently there is no way to bundle these files. [dts-bundle](https://github.com/TypeStrong/dts-bundle) is a naiive string-based approach to generate the bundled typing files. We use an additional python script to process the generated bundle and produce the final version, its current default behavious rewrites the typings to expose the functions to the global scope.

```bash
npm run build:typings
```

This way the projet that uses miojslibs has to include the type declaration files in compilation.
So in **tsconfig.json** the `compilerOptions.types` property must include `"miojslibs"`.

```json
{
    "compilerOptions": {
        "types": [
            "miojslibs"
        ]
    }
}
```

> If the typing information is not loaded for any reason from the **package.json** `types` property of MIOJSLibs, then the **project's tsconfig.json** should include the `"typeRoots"="./node_modules/miojslibs/dist/typings/"` as well.

<!-- When we'll support `es6` module imports for clients, this step will not be necessary, and the modules should be imported to the files that'll use them. -->

### Web workers

The project uses [web workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) to outsource the processing to separate threads.
The webworkers run in a different context, so the build has to be separate.
In order to be able to use typescript, and the same functionality for webworkers,
we build the webworkers with their separate webpack configurations.
> You have to be careful not to include any functionality, that includes things that are not available in the webworker-context,
> (you can see [what are available in webworker context here](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers))
> then it might not compile, or even worse, it can cause runtime errors in the workers and it might lead unexpected behaviour.

You can use the same [es6 module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)
imports as you would do with any other typescript file.

The generated webworker `.js` files will include all the included sources, it means that the functionality will be loaded to your webworker context.
Only the used functions will be included, not the whole files.

```bash
npm run build:webworkers
```

### Multiple platform

The project is available to be built for **multiple platforms**.

Each module contains its platform dependent code in the `platform` folder. Currently a preprocessing step is achieved with [ifdef-loader](https://github.com/nippur72/ifdef-loader), to exclude the unnecessary parts per platform.

For each platform there exists a `tsconfig.${TARGET}.json` file which contains what files are processed by `ts-loader` in webpack. It does not care about the entrypoint barrel exports, it will process every file that is *explicitly added* or *not excluded*, so if you add an extra module, your build might fail, due to missing platform dependent code.

>VSCode is **not** aware of these **tsconfig files** nor the **ts-loader comments**, so it might add extra error messages, that are not relevant, because they don't happen during build time.

Currently there are two versions of the libs:

* `Core`: does not have any UI related code. Works on node.js.
* `Webapp`: Contains the whole library.