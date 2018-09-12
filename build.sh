#!/bin/bash

# i need directory of the script
#SCRIPT_DIR=dirname "$(readlink -f "$0")"
#echo $SCRIPT_DIR
echo "[BUILD-SCRIPT] Build started"
echo "[BUILD-SCRIPT] Building server..."
cd server
gradle fatJar
echo "[BUILD-SCRIPT] Copying protocol to jar location..."
cp ../arenaProtocol.json build/libs/
cd ..
echo "[BUILD-SCRIPT] Building client... Mode: DEBUG (hardcoded)"
cd client
npm run build_debug
