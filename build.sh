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
cp package.dist.json dist/package.json

