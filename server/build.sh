#!/bin/bash

gradle fatJar
cp ../arenaProtocol.json build/libs/
cd /home/ympson/development/arena/client/
node pack_protocol.js
