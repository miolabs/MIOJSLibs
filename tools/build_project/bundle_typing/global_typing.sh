#! /bin/bash

# This script bundles the definitions built by webpack into one file 
# It uses dts-bundle node module.
# The definitions will be available in the global scope in order to support projects without modules
# author: budavariam <budavariam.github.io>

# os: mac/linux
# run source: shall be project root directory / package.json script
# dependencies: 
#   - it requires all of the built definitions in order to bundle them
#   - python3, node, mkdir, cp

NAME=miojslibs
TARGET=$1
PACKAGENAME=miojslibs`[ "${TARGET}" == "core" ] && echo "-core" || echo ""`

node ./tools/build_project/bundle_typing/utils/dts-bundle.js $NAME $TARGET

DIST_PATH=./packages/${PACKAGENAME}/dist/typings/${PACKAGENAME}

mkdir -p $DIST_PATH
python ./tools/build_project/bundle_typing/utils/proccess_bundle.py ./packages/${PACKAGENAME}/build/types/${NAME}.d.ts --legacy --target $DIST_PATH/index.d.ts
