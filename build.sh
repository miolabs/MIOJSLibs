#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color
#Black        0;30     Dark Gray     1;30
#Red          0;31     Light Red     1;31
#Green        0;32     Light Green   1;32
#Brown/Orange 0;33     Yellow        1;33
#Blue         0;34     Light Blue    1;34
#Purple       0;35     Light Purple  1;35
#Cyan         0;36     Light Cyan    1;36
#Light Gray   0;37     White         1;37

printf "${YELLOW}Empty build directory ...${NC}\n"
rm -r build

printf "${GREEN}Building MIOCore\n";
tsc -p source/MIOCore
printf "${GREEN}Building MIOCorePlatform. Target: ${NC}";
if [[ ("$1" == "ios") || ("$1" == "iOS") ]]
then
    printf "${RED}iOS${NC}\n"
    tsc -p source/MIOCorePlatforms/iOS
else
    printf "${RED}web${NC}\n"
    tsc -p source/MIOCorePlatforms/Web
    printf "  ${GREEN}Building WebWorkers: ${NC}\n"
    printf "    ${GREEN}- MIOCoreBundle_WebWorker${NC}\n"
    tsc -p source/MIOCoreWebWorkers/MIOCoreBundle_WebWorker
fi
printf "${GREEN}Building MIOFoundation ...${NC}\n";
tsc -p source/MIOFoundation
printf "${GREEN}Building MIOUI ...${NC}\n";
tsc -p source/MIOUI
printf "${GREEN}Building MIOData ...${NC}\n";
tsc -p source/MIOData
printf "${GREEN}Building MIOWebServicePersistentStore ...${NC}\n";
tsc -p source/MIOWebServicePersistentStore