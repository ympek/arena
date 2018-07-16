var config = {
  serverAddr: "localhost:8020", // URI for game server,
};

var DOMElements = {
  canvas: document.getElementById("arena-canvas"),
  canvasBox: document.getElementById("canvas-box"),
  namePrompt: document.getElementById("name-prompt"),
  logoDiv: document.getElementById("logodiv")
};

var ctx = DOMElements.canvas.getContext('2d');

// loaded later in prepareGame from Provider;
// should be IIFE property.
var protocol;

if (document.readyState === "complete") {
  prepareGame();
} else {
  document.addEventListener("DOMContentLoaded", prepareGame);
}

function prepareGame() { // to sie wykonuje 1st.
  protocol = Loader.loadProtocol();
  console.log('Loaded protocol', protocol);

  Socket.establishConnection(config.serverAddr);
  document.addEventListener('conn.established', function() {
    registerSocketListener();
  });

  // add form listener to Join the battle form
  // later on we send msgId 0x00 which is loginReq
  document.getElementById("name-form").onsubmit = function(e) {
    e.preventDefault();
    var val = document.getElementById("name-input").value;

    dispatchMessage(0, {
      name: val.trim()
    });
   };

   GraphicsEngine.run();
}

function dispatchMessage(msgId, params) { // Message ID can be number or string.
  var clientTypes = protocol.clientToServerMessage.messageTypes;
  if (typeof msgId === "number") {
    // fall through
  } else if (typeof msgId === "string") {
    var numericId = -1;
    clientTypes.forEach(function (clientType, index) {
      if (clientType.messageName === msgId) {
        numericId = index;
        return false;
      }
    });

    if (numericId === -1) {
      console.error('Message identifier' + msgId +'not found in protocol.');
    } else {
      msgId = numericId;
    }
  } else {
    console.error('Invalid type of message identifier.');
  }

  var protocolParams = clientTypes[msgId].messageParameters;

  var paramsMap = {};
  protocolParams.forEach(function (param, index) {
    paramsMap[param.name] = {};
    paramsMap[param.name].index = index;
    paramsMap[param.name].name  = param.name;
    paramsMap[param.name].size  = param.size;
    paramsMap[param.name].type  = param.type;
  }); // taka odwrotna tablica

  console.log('paramsMap', paramsMap);

  var paramsArray = [];
  for (var key in params) {
    if (params.hasOwnProperty(key)) {
      paramsMap[key].value = params[key];

      var idx = paramsMap[key].index;
      paramsArray[idx] = paramsMap[key];
    }
  }

  console.log('paramsArray', paramsArray);

  Socket.send(msgId, paramsArray);
}


function registerSocketListener() {
  document.addEventListener('data.received', function (ev) {
    var msg = decodeByProtocol(ev.detail);
    switch(msg._name) {
      case "loginAck":
        showArenaCanvas();
        GraphicsEngine.addPlayer(msg.spawnX, msg.spawnY); // also ID needed.
        break;
      case "loginRej":
        break;
      default:
        console.log("Unknown msg");
    }
  });
}

function showArenaCanvas()
{
  DOMElements.namePrompt.style = 'display: none';
  DOMElements.logoDiv.style = 'display: none';
  DOMElements.canvasBox.style = 'display: block';
  document.body.style.background = 'white';
}

function decodeByProtocol(bytes) {
  if (!bytes || bytes.constructor !== ArrayBuffer) {
    console.error("Received corrupted/invalid message from server", bytes);
  }

  var dataView = new DataView(bytes);
  var msgId = dataView.getInt8(0);
  var messages = protocol.serverToClientMessage.messageTypes;
  var receivedMsg = messages[msgId];

  console.log("Received message:", receivedMsg.messageName);

  var currentView;
  var decodedMsg = {};
  var offset = 1;
  receivedMsg.messageParameters.forEach(function (param, i) {
    var numOfParamBytes = param.size / 8;
    currentView = new DataView(bytes, offset);
    if (param.type == "int") {
      if (param.size == 8) {
        decodedMsg[param.name] = currentView.getInt8();
      }
      if (param.size == 32) {
        decodedMsg[param.name] = currentView.getInt32();
      }
    }
    if (param.type == "double") {
      decodedMsg[param.name] = currentView.getFloat64();
    }
    if (param.type == "string")
    {
      console.log("Decoded string. TODO");
    }
    offset += param.size/8;
  });
  console.log("Decoded Msg: ", decodedMsg);
  decodedMsg._name = receivedMsg.messageName;
  return decodedMsg;
}

// trzeba bedzie chyba throttlowac te kliki.
DOMElements.canvas.oncontextmenu = function(ev) {
  ev.preventDefault();
  dispatchMessage("actionInd", {
    absMouseCoordX: 5,
    inputId: 40,
    absMouseCoordY: 10
  });
};