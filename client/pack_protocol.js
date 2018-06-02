const protocol = require('../arenaProtocol.json');
const fs = require('fs');

let content = fs.readFileSync('./placeholder.js', 'utf8');
let protocolPacked = JSON.stringify(protocol);
protocolPacked = protocolPacked.replace(/\\([\s\S])|(")/g, "\\$1$2");

content = content.replace(/_PLACEHOLDER_/g, protocolPacked);
fs.writeFileSync('./js/ProtocolProvider.js', content);
