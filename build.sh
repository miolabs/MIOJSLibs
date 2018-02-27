#!/bin/bash

# Set source folder to support build from another location.
#
# The first param sets the folder to load the config files from. 
# If it is not available, it will default to 'source'
SOURCE_FOLDER="${1:-source}"

# Colorize the shell output
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

printf "${GREEN}Generate the libs from${NC} ${RED}${SOURCE_FOLDER}${NC} ${GREEN}directory ...${NC}\n";

printf "${YELLOW}Empty${NC} ${RED}build${NC} ${YELLOW}directory ...${NC}\n"
rm -r build

printf "${GREEN}Building MIOCore\n${NC}";
tsc -p ${SOURCE_FOLDER}/MIOCore
printf "${GREEN}Building MIOCorePlatform. Target: ${NC}";
if [[ ("$2" == "ios") || ("$2" == "iOS") ]]
then
    printf "${RED}iOS${NC}\n"
    tsc -p ${SOURCE_FOLDER}/MIOCorePlatforms/iOS
else
    printf "${RED}web${NC}\n"
    tsc -p ${SOURCE_FOLDER}/MIOCorePlatforms/Web
    printf "  ${GREEN}Building WebWorkers base: ${NC}\n"
    tsc -p ${SOURCE_FOLDER}/MIOCorePlatforms/WebWorkers
    printf "    ${GREEN}- Bundle_WebWorker${NC}\n"
    tsc -p ${SOURCE_FOLDER}/MIOCorePlatforms/Web/WebWorkers/Bundle_WebWorker
fi
printf "${GREEN}Building MIOFoundation ...${NC}\n";
tsc -p ${SOURCE_FOLDER}/MIOFoundation
printf "${GREEN}Building MIOUI ...${NC}\n";
tsc -p ${SOURCE_FOLDER}/MIOUI
printf "${GREEN}Building MIOData ...${NC}\n";
tsc -p ${SOURCE_FOLDER}/MIOData
printf "${GREEN}Building MIOWebServicePersistentStore ...${NC}\n";
tsc -p ${SOURCE_FOLDER}/MIOWebServicePersistentStore