# Usage

## Prerequisites

* Download and install [npm(node)](https://nodejs.org/en/download/)

## Getting started

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
