# Contribuion

## Develop the libs alongside your project

1. Download [MIOJSLibs](https://github.com/miolabs/MIOJSLibs) into your machine.
1. Link the [miojslibs](https://www.npmjs.com/package/miojslibs) package to your local global npm.
   Navigate to MIOJSLibs folder and run `npm link`.
   ([more info](https://docs.npmjs.com/cli/link)).

   ```bash
   cd path-to-miojslibs/MIOJSLibs
   npm link
   ```

1. Link [miojslibs](https://www.npmjs.com/package/miojslibs) package to your project from your local global npm.
   >This will create a symlink from your project's **node_modules** folder to the **MIOJSLibs project** folder.

   ```bash
   cd path-to-project
   npm link miojslibs
   ```

1. From now on if you rebuild the MIOJSLibs project the generated files will be seen by your app.

When you don't need **the link** anymore you can unlink the [miojslibs](https://www.npmjs.com/package/miojslibs) from this repository. But this removes the folder from `node_modules`, and `package.json` so you have to install it again from npm.

```bash
npm unlink miojslibs
npm install miojslibs
```

## Publish to npm

[Docs](https://docs.npmjs.com/getting-started/publishing-npm-packages)

```bash
# Log in with the authenticated user: npm adduser
# Add changes to git if any. Eg: git add . && git commit -m 'New build'
npm version <update_type: patch, minor, major>
npm run prod
# Check the files that you are about to publish: npm pack
npm publish
```