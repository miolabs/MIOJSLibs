# Usage

## Prerequisites

* Download and install [npm(node)](https://nodejs.org/en/download/)

## Getting started from a template

### Setup

1. install [miojs](https://www.npmjs.com/package/miojs), a command-line tool to help with the projects built with MIOJSLibs.

   ```bash
   npm install miojs -g
   ```

1. run `init`, with the desired project name.

   ```bash
   miojs init my-new-project-name
   ```

   >It will create a basic frame for the project, into a new folder that is named as the given project name.

1. Congratulations, now you have a template project that uses MIOJSLibs.

### Build the project

1. Navigate to the project folder.
1. Install the dependencies (including miojslibs).

   ```bash
   npm install
   ```

1. Install && copy the miojslibs to `app/libs/miojslibs`

   ```bash
   npm run update-libs # since it uses cp currently it only works in mac||linux
   ```

1. Build the scss files of the project

   ```bash
   npm run scss:watch
   ```

1. Bundle the typescript files of the project.

   ```bash
   npm run build
   ```

### Start the project

1. Serve the files with a basic `http-server`.

   ```bash
   npm start
   ```

1. Navigate to [http://localhost:9090](http://localhost:9090) in an ES5 compatible browser.

## Getting started from scratch

1. Initialize your project with npm (if you haven't already).

   ```bash
   cd my-project-directory
   npm init
   ```

   > This will create a `package.json` file into the project root directory.
1. Install `miojslibs` (this project) from npm.

   ```bash
   npm install miojslibs --save
   ```

1. If you use typescript add **miojslibs** to *types* into `tsconfig.json`.

    ```json
    {
        "compilerOptions": {
            "types": [
                "miojslibs"
            ]
        }
    }
    ```
1. Copy/move/reference the `node_modules/miojslibs/dist/js` folder to your publicly served files under `libs/miojslibs`.
   > This project uses webworkers, currently they are loaded from `libs/miojslibs/webworkers`, they need to be placed in that folder due to the fact that webworkers' scriptURL argument is relative to the entry script's base URL.
1. Add the script to your `index.html` before any other MIOJSLibs related scripts.

    ```html
    <script src="libs/miojslibs/miojslibs.js"></script>
    ```

1. Use the framework.
