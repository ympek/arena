/* global console, document */
/* global Socket */

// BTW, we dont target older IE versions

var config = {
  serverAddr: "ympek.net:8020", // URI for game server,
  offlineMode: true // just for development
};

// for offline development
// config.serverAddr = "localhost:8020";

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

function getBinarizeFunc(type) {
  switch(type) {
    case "int":
      return binarizeInt; 
    case "float":
    case "double":
      return binarizeFloat;
    case "string":
      return binarizeString;
    default:
      return function() {};
  }
}


function sendFromProto(msgId, params) {
  // to sie powinno wyzej zadziac raczej
  var clientTypes = protocol.clientToServerMessage.messageTypes;
  if (typeof msgId === "number") {
    // its ok, skip
  } else if (typeof msgId === "string") {
    var numericId = -1;
    clientTypes.forEach(function (clientType, index) {
      if (clientType.messageName === msgId) {
        numericId = index;
        // przerwij
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

  send_anything(msgId, paramsArray);
};

// jesli jest tylko jeden parametr to wiadomo o co chodzi
// to trzeba tez obsluzyc, ale moze nie od razu
// sendFromProto("loginReq", { name: "szymon"});
// jesli jest obiekt 

function send_anything(messageId, paramsArray) {
  var byteData = [];
  var size = 1;

  paramsArray.forEach(function (param, index) {
    var binaryOut = getBinarizeFunc(param.type)(param.size, param.value);
    byteData[index] = binaryOut;
    byteData[index].view = new Uint8Array(binaryOut.buffer);
    size += binaryOut.size/8;
  });
  
  var bufAll = new ArrayBuffer(size);
  var bufView = new Uint8Array(bufAll);
  bufView[0] = messageId;

  var globCounter = 1;
  
  byteData.forEach(function (bd, index) {
    for (var i = 0; i < bd.size/8; i++) {
      bufView[globCounter] = bd.view[i];
      globCounter++;
    }
  });

  Socket.sendString(bufAll);
}

function binarizeString(size, value) {
  console.log("Binarize String");
  var buf = new ArrayBuffer(size);
  var bufView = new Uint8Array(buf);
  for (var i = 0, len = value.length; i < len; i++) {
    bufView[i] = value.charCodeAt(i);
  }
  return {
    size: size,
    buffer: buf
  };
}

function binarizeFloat(size, value) {
  console.log("Binarize Float");
  var buf = new ArrayBuffer(size);
  var dataView = new DataView(buf);
  dataView.setFloat64(0, value);
  // sock.send(msg.buffer);
  // sock.send(dataView);
  return {
    size: size,
    buffer: buf
  };
}

function binarizeInt(size, value) {
  console.log("Binarize int");
  // tylko ze tutaj zakladam de facto ze kazdy int bedzie 8
  var buf = new ArrayBuffer(size);
  var dataView = new DataView(buf);
  dataView.setInt8(0, value);
  // sock.send(msg.buffer);
  // sock.send(dataView);
  return {
    size: size,
    buffer: buf
  };
}

var protocol;

function prepareGame() {
  "use strict";
  DOMElements.preloader.innerHTML = "Preparing game...";

  protocol = Loader.loadProtocol();
  console.log('protocol', protocol);

  if (!config.offlineMode) {
    Socket.establishConnection(config.serverAddr);
  } else {
    Socket.establishConnection(config.serverAddr);
    document.addEventListener('conn.established', function() {
      Socket.sendString("bababab");
    });
  }

  document.getElementById("name-form").onsubmit = function(e) {
    e.preventDefault();
    var val = document.getElementById("name-input").value;
    // Encoder.init();
    // var bytes = Encoder.encode("string", val);
    // Socket.send
    // send_loginReq(val);
    // send_anything(0, [{
    //   name: "loginReq",
    //   size: 512,
    //   type: "string",
    //   value: val
    // }]);
    sendFromProto(0, {
      name: val
    });
  };
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
