/* global console, document */
/* global Socket */

var config = {
  serverAddr: "localhost:8021", // URI for game server,
};

var DOMElements = {
  preloader: document.getElementById("preloader"),
  canvas: document.getElementById("arena-canvas"),
  canvasBox: document.getElementById("canvas-box"),
  namePrompt: document.getElementById("name-prompt")
};

var ctx = DOMElements.canvas.getContext('2d');

// place for preloader

if (document.readyState === "complete") {
  prepareGame();
} else {
  document.addEventListener("DOMContentLoaded", prepareGame);
}

function receiveFromProto(msgId, params) {

}

function sendFromProto(msgId, params) { // Message ID can be number or string.
  // to sie powinno wyzej zadziac raczej
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

// jesli jest tylko jeden parametr to wiadomo o co chodzi
// to trzeba tez obsluzyc, ale moze nie od razu
// sendFromProto("loginReq", { name: "szymon"});
// jesli jest obiekt



var protocol;

function registerSocketListener() {
  document.addEventListener('data.received', function (ev) {
    var msg = decodeByProtocol(ev.detail);
    switch(msg._name) {
      case "loginAck":
        showArenaCanvas();
        putPlayer(msg.spawnX, msg.spawnY);
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
  DOMElements.canvasBox.style = 'display: block';
  document.body.style.background = 'white';
}

function putPlayer(x, y)
{
  console.log("Putting player at : " ,x ,y);
  ctx.fillStyle = 'rgb(255, 0, 0)';
  ctx.fillRect(x, y, 10, 10);
}

function prepareGame() {
  "use strict";
  DOMElements.preloader.innerHTML = "Preparing game...";

  protocol = Loader.loadProtocol();
  console.log('protocol', protocol);

  Socket.establishConnection(config.serverAddr);
  document.addEventListener('conn.established', function() {

    registerSocketListener();
  });

  document.getElementById("name-form").onsubmit = function(e) {
    e.preventDefault();
    var val = document.getElementById("name-input").value;
    sendFromProto(0, {
      name: val.trim()
    });
   };
}

function decodeByProtocol(bytes) { // Type: ArrayBuffer
  console.log("Decoding...");
  console.log(bytes);
  // spodziewam sie ze tu przyjdzie buffer

  if (!bytes || bytes.constructor !== ArrayBuffer)
  {
    console.error("Received corrupted/invalid message from server: ");
  }
  var dataView = new DataView(bytes);
  var msgId = dataView.getInt8(0);
  /// Actually decode: should be own func

  // array of msgs
  var messages = protocol.serverToClientMessage.messageTypes;


  var receivedMsg = messages[msgId];
  console.log("Co to za message:" , receivedMsg);

  console.log("Received message:", receivedMsg.messageName);
  var currentView;
  var decodedMsg = {};
  var offset = 1;
  receivedMsg.messageParameters.forEach(function (param, i) {
    console.log(param);
    var numOfParamBytes = param.size/8;
    currentView = new DataView(bytes, offset);
    if (param.type == "int") {
      if (param.size == 8) {
        decodedMsg[param.name] = currentView.getInt8();
      }
      if (param.size == 32) {
        decodedMsg[param.name] = currentView.getInt32();
      }
    }
    if (param.type == "double")
    {
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

function getMousePos(evt) {
  "use strict";
  var rect = DOMElements.canvas.getBoundingClientRect();
  console.log("GetMousePos", evt.clientX, evt.clientY, rect.left, rect.top);
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

// trzeba bedzie chyba throttlowac te kliki.
DOMElements.canvas.oncontextmenu = function(ev) {
  "use strict";
  ev.preventDefault();
  console.log("right click");
  var mousePos = getMousePos(ev);
  var message = "Mouse position: " + mousePos.x + "," + mousePos.y;

  // Socket.send("actionInd", ["test"], 16);
  console.log("Mouse position: " + mousePos.x + "," + mousePos.y);

  // send_anything(1, [
  //   {
  //     name: "inputId",
  //     type: "int",
  //     size: 8,
  //     value: 40
  //   },
  //   {
  //     type: "float",
  //     name: "absMouseCoordX",
  //     size: 64,
  //     value: mousePos.x
  //   },
  //   {
  //     type: "float",
  //     name: "absMouseCoordY",
  //     size: 64,
  //     value: mousePos.y
  //   }
  // ]);
  sendFromProto("actionInd", {
    absMouseCoordX: mousePos.x,
    inputId: 40,
    absMouseCoordY: mousePos.y
  });
};

DOMElements.canvas.onclick = function(ev) {
  "use strict";
  console.log("left click");
  var mousePos = getMousePos(ev);
  console.log("Mouse position: " + mousePos.x + " --- " + mousePos.y);
};
