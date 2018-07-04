#!/bin/bash

gradle fatJar
cp ../arenaProtocol.json build/libs/
cd ../client/
node pack_protocol.js
