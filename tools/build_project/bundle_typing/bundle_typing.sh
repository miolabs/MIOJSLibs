#! /bin/bash

# this script bundles the definitions built by webpack into one file with dts-bundle node module.
# author: budavariam <budavariam.github.io>

# os: mac/linux
# run source: shall be project root directory / package.json script
# dependencies: 
#   - it requires all of the built definitions in order to bundle them
#   - python3, node, mkdir, cp

NAME=miojslibs
TARGET=$1

node ./tools/build_project/bundle_typing/utils/dts-bundle.js $NAME $TARGET

mkdir -p ./dist/typings/${NAME}
python3 ./tools/build_project/bundle_typing/utils/proccess_bundle.py build/types/${NAME}.d.ts --target dist/typings/${NAME}/index.d.ts
