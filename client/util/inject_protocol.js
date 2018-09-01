const protocol = require('../../arenaProtocol.json');
const fs = require('fs');

let content = fs.readFileSync('./util/placeholder.js', 'utf8');
let protocolPacked = JSON.stringify(protocol);
protocolPacked = protocolPacked.replace(/\\([\s\S])|(")/g, "\\$1$2");

content = content.replace(/_PLACEHOLDER_/g, protocolPacked);
fs.writeFileSync('./dist/outfiles/_ProtocolProvider.js', content);
