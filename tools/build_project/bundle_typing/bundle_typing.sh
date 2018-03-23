#! /bin/bash

NAME=miojslibs

node ./tools/build_project/bundle_typing/dts-bundle.js $NAME

# TODO: remove 'import from [^{]...' lines automatically/platform independently

mkdir -p ./dist/typings/${NAME}
cp build/types/${NAME}.d.ts dist/typings/${NAME}/index.d.ts