#! /bin/bash

NAME=miojslibs

node ./tools/build_project/bundle_typing/dts-bundle.js $NAME

mv build/types/${NAME}.d.ts build