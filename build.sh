#!/bin/bash

webpack_env=""
if [ $1 = "prod" ] 
then    
     webpack_env="--mode=production --node-env=production"
fi

rm -rf dist
TARGET=web npx webpack $webpack_env
TARGET=webworker npx webpack $webpack_env
npx tsc source/index.web.ts --declaration --emitDeclarationOnly --outfile dist/miojslibs.d.ts
node tools/generate_global_dts.js
cp package.dist.json dist/package.json

# DLWebManager (and siblings) consume the package with dist/ as its root and
# expect the bundles under <package>/dist/js — keep that nested layout in sync.
mkdir -p dist/dist/js
cp dist/*.js dist/*.js.map dist/dist/js/

