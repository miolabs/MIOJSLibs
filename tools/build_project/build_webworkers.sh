#!/bin/bash

# Goes through all webworker folders, and build the ones that has a webpack configuration file.

WEBWORKERS_FOLDER='source/MIOCorePlatform/WebWorkerClasses'

for d in ${WEBWORKERS_FOLDER}/*/ ; do 
    (cd "$d" && [[ -f webpack.config.js ]] && npx webpack); 
done;

cp build/ww/* dist/js/ww