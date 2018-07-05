#! /bin/bash

# This script bundles the definitions built by webpack into one file 
# It uses dts-bundle node module.
# You can import the necessary classes from these generated modules.
# author: budavariam <budavariam.github.io>

# os: mac/linux
# run source: shall be project root directory / package.json script
# dependencies: 
#   - it requires all of the built definitions in order to bundle them
#   - python3, node, mkdir, cp

NAME=$1
TARGET=$2

node ./tools/build_project/bundle_typing/utils/dts-bundle.js $NAME $TARGET

DIST_PATH=./packages/${NAME}/dist/typings/${NAME}

mkdir -p $DIST_PATH
python3 ./tools/build_project/bundle_typing/utils/proccess_bundle.py ./packages/${NAME}/build/types/${NAME}.d.ts --target $DIST_PATH/index.d.ts
