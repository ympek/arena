/* global console, document */
/* global WebSocket */

// BTW, we dont target older IE versions

var config = {
  serverAddr: "ympek.net:8020", // URI for game server,
  offlineMode: false // just for development
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

function prepareGame() {
  "use strict";
  DOMElements.preloader.innerHTML = "Preparing game...";

  if (!config.offlineMode) {
    Socket.establishConnection();
  }
}

function getMousePos(evt) {
  "use strict";
  var rect = DOMElements.canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

// trzeba bedzie chyba throttlowac te kliki.
DOMElements.canvas.oncontextmenu = function(ev) {
  "use strict";
  ev.preventDefault();
  console.log('right click');
  var mousePos = getMousePos(ev);
  var message = "Mouse position: " + mousePos.x + "," + mousePos.y;

  Socket.send("actionInd", ["test"], 16);
};

DOMElements.canvas.onclick = function(ev) {
  "use strict";
  console.log('left click');
  var mousePos = getMousePos(ev);
  console.log("Mouse position: " + mousePos.x + "," + mousePos.y);

  Socket.send("tradeInd", ["testAction"], 32);

};

function encodeMsg(msgId, msg) {

};

// wysokopoziomowo
// 

var clientToServerMsgMap = {};

// building id arrays
// protocol.clientToServerMessage.messageTypes.forEach(function (type, id) {
//   "use strict";
//   clientToServerMsgMap[type] = id; // 
// });

var protocol = {
  messageIdSize: 8,
  clientToServerMessage: {
    messageTypes: [
      {
        messageName: "loginReq",
        messageParameters: [
          {
            name: "name",
            size: 512,
            type: "string"
          }
        ]
      },
      {
        messageName: "actionInd",
        messageParameters: [
          {
            name: "inputId",
            size: 8,
            type: "int"
          },
          {
            name: "absMouseCoordX",
            size: 64,
            type: "double"
          },
          {
            name: "absMouseCoordY",
            size: 64,
            type: "double"
          }
        ]
      },
      {
        messageName: "tradeInd",
        messageParameters: [
          {
            name: "inputId",
            size: 8,
            type: "int"
          },
          {
            name: "absMouseCoordX",
            size: 64,
            type: "double"
          },
          {
            name: "absMouseCoordY",
            size: 64,
            type: "double"
          }
        ]
      }
    ]
  },
  serverToClientMessage: {
    messageTypes: [
      {
        messageName: "loginAck",
        messageParameters: [
          {
            name: "answerCode",
            size: 8,
            type: "int"
          }
        ]
      },
      {
        messageName: "moveUpdateInd",
        messageParameters: [
          {
            name: "objectId",
            size: 8,
            type: "int"
          },
          {
            name: "absPositionCoordX",
            size: 64,
            type: "double"
          },
          {
            name: "absPositionCoordY",
            size: 64,
            type: "double"
          },
          {
            name: "absTargetCoordX",
            size: 64,
            type: "double"
          },
          {
            name: "absTargetCoordY",
            size: 64,
            type: "double"
          },
          {
            name: "objectSpeed",
            size: 64,
            type: "double"
          }
        ]
      }
    ]
  }
};

// 1) jak cos wyslac.

var Socket = (function() {
  "use strict";
  var sock;

  var establishConnection = function() {
    sock = new WebSocket("ws://" + config.serverAddr);
    sock.binaryType = "arraybuffer"; // we encode msgs as binary so

    sock.onopen = function(event) {
      console.log("Connection established.");
      sock.send("Opening!");
    };

    sock.onmessage = function(event) {
      console.log("recv data.");
      console.log(event.data);
    };
  };

  var getMessageIdByName = function (msgName) {
    var len = protocol.clientToServerMessage.messageTypes.length;
    for (var i = 0; i < len; i++) {
      if (protocol.clientToServerMessage.messageTypes[i].messageName === msgName) {
        return i;
      }
    }
    return -1;
  };
  // var createBinaryString = function (n) {
  //   // for (var nFlag = 0, nShifted = n, sMask = ""; nFlag < 8;
  //   //     nFlag++, sMask += String(nShifted >>> 7), nShifted <<= 1);
  //   // return sMask;
  //   var bin = Number(n).toString(2);
  //   for (var i = 0; i < bin.length; i++) {

  //   }
  // };

  var send = function(msgName, params, test) {
    // encode
    var msg = '';
    var id = getMessageIdByName(msgName);
    msg += id;

    msg += "dupa";

    // actually send
    // pytanie czy big czy little endian
    console.log(msg);
    var buf = new ArrayBuffer(test);
    var msg = new Int8Array(buf);
    msg[15] = id; 
    sock.send(msg);
  };

  return {
    establishConnection: establishConnection,
    send: send
  };
})();
