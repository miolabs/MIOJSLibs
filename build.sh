#!/bin/bash

GREEN='\033[0;32m'
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

printf "${YELLOW}Empty dist directory ...${NC}\n"
rm -r dist

printf "${GREEN}Building MIOFoundation ...${NC}\n";
tsc -p source/MIOFoundation
printf "${GREEN}Building MIOCore ...${NC}\n";
tsc -p source/MIOCore
printf "${GREEN}Building MIOUI ...${NC}\n";
tsc -p source/MIOUI
printf "${GREEN}Building MIOData ...${NC}\n";
tsc -p source/MIOData
printf "${GREEN}Building MIOWebServicePersistentStore ...${NC}\n";
tsc -p source/MIOWebServicePersistentStore
printf "${GREEN}Building webworkers ...${NC}\n";
tsc -p source/webworkers