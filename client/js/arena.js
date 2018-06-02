/* global console, document */
/* global Socket */

var config = {
  serverAddr: "localhost:8021", // URI for game server,
};

var DOMElements = {
  preloader: document.getElementById("preloader"),
  canvas: document.getElementById("arena-canvas")
};

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
    console.error('Invalid type of message identifier.')
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
};

// jesli jest tylko jeden parametr to wiadomo o co chodzi
// to trzeba tez obsluzyc, ale moze nie od razu
// sendFromProto("loginReq", { name: "szymon"});
// jesli jest obiekt



var protocol;

function registerSocketListener() {
  document.addEventListener('data.received', function (ev) {
    decodeByProtocol(ev.detail);
  });
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
  var answerCode = dataView.getInt8(1);
  console.log('i guess messageId is: ', msgId, "answerCode", answerCode);
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
