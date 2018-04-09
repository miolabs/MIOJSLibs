# Contribuion

## Publish to npm

[Docs](https://docs.npmjs.com/getting-started/publishing-npm-packages)

```bash
# Log in with the authenticated user: npm adduser
npm run prod
# Add changes to git if any. Eg: git add . && git commit -m 'New build'
# Check the files that you are about to publish: npm pack
npm version <update_type: patch, minor, major>
npm publish
```