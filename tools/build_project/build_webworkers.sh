#!/bin/bash

# Goes through all webworker folders, and build the ones that has a webpack configuration file.

WEBWORKERS_FOLDER='./source/MIOWebWorker'
TARGET=$1
for d in ${WEBWORKERS_FOLDER}/*/ ; do 
    (cd "$d" && [[ -f webpack.config.js ]] && cross-env TARGET=${TARGET} npx webpack); 
done;