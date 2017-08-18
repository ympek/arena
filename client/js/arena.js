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

function send_loginReq(value) {
  var len = 64;
  var buf = new ArrayBuffer(len + 1);
  var bufView = new Uint8Array(buf);
  bufView[0] = 0;
  for (var i = 1; i <= len; i++) {
    console.log(i);
    if (value.charCodeAt(i - 1)) {
      bufView[i] = value.charCodeAt(i - 1);
    } else {
      bufView[i] = 0;
    }
  }
  Socket.sendString(buf);
}

function getBinarizeFunc(type) {
  switch(type) {
    case "int":
      return binarizeInt; 
    case "float":
      return binarizeFloat;
    case "string":
      return binarizeString;
    default:
      return function() {};
  }
}

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

function send_actionInd(inputId, absMouseCoordX, absMouseCoordY) {
  var len = 17; // int8 + 2 floaty 64(1 + 8 + 8)
  var bufAll = new ArrayBuffer(len + 1);
  var bufView = new Uint8Array(bufAll);
  bufView[0] = 1;

  var int1 = binarizeInt(8, 42);
  var float1 = binarizeFloat(64, 501.502);
  var float2 = binarizeFloat(64, 102.322);

  var int1View = new Uint8Array(int1.buffer);
  var float1View = new Uint8Array(float1.buffer);
  var float2View = new Uint8Array(float2.buffer);

  // var buf = new ArrayBuffer(size);
  // var dataView = new DataView(buf);
  // dataView.setInt8(0, value);

  console.log('Dupa', int1View[0]);

  for (var i = 1; i <= len; i++) {
    bufView[1] = int1View[0];

    bufView[2] = float1View[0];
    bufView[3] = float1View[1];
    bufView[4] = float1View[2];
    bufView[5] = float1View[3];
    bufView[6] = float1View[4];
    bufView[7] = float1View[5];
    bufView[8] = float1View[6];
    bufView[9] = float1View[7];

    bufView[10] = float2View[0];
    bufView[11] = float2View[1];
    bufView[12] = float2View[2];
    bufView[13] = float2View[3];
    bufView[14] = float2View[4];
    bufView[15] = float2View[5];
    bufView[16] = float2View[6];
    bufView[17] = float2View[7];
  }

  console.log('aaaa', len);
  for (var i = 0; i <= len; i++) {
    console.log('bbb');
    console.log(bufView[i]);
  }

  Socket.sendString(bufAll);
}

function testEncoder(encoder) {
  "use strict";
  console.log("Bd testowac");
  encoder.init();
  // var bytes = encoder.encode(1, ["dupa"]); // zawsze trzeba bd to podawac jako tablice? nie rob tak

  var obj = binarizeString(16, "11szymon");
  var obj2 = binarizeInt(1, 564);

  var bufView = new Uint8Array(obj.buffer);
  var bufView2 = new Int8Array(obj2.buffer);

  document.addEventListener("conn.established", function() {
    // Socket.sendString(obj.buffer);
    // Socket.sendString()
    // sendBinaryString("abc");
  });
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

function prepareGame() {
  "use strict";
  DOMElements.preloader.innerHTML = "Preparing game...";

  if (!config.offlineMode) {
    Socket.establishConnection(config.serverAddr);
  } else {
    Socket.establishConnection(config.serverAddr);
    // testEncoder(Encoder);
  }

  document.getElementById("name-form").onsubmit = function(e) {
    e.preventDefault();
    var val = document.getElementById("name-input").value;
    // Encoder.init();
    // var bytes = Encoder.encode("string", val);
    // Socket.send
    send_loginReq(val);
  };
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
  console.log("right click");
  var mousePos = getMousePos(ev);
  var message = "Mouse position: " + mousePos.x + "," + mousePos.y;

  // Socket.send("actionInd", ["test"], 16);
  console.log("Sending......")
  send_anything(1, [
    {
      name: "inputId",
      type: "int",
      size: 8,
      value: 40
    },
    {
      type: "float",
      name: "absMouseCoordX",
      size: 64,
      value: 907.502
    },
    {
      type: "float",
      name: "absMouseCoordY",
      size: 64,
      value: 707.502
    }
  ]);
};

DOMElements.canvas.onclick = function(ev) {
  "use strict";
  console.log("left click");
  var mousePos = getMousePos(ev);
  console.log("Mouse position: " + mousePos.x + "," + mousePos.y);

  Socket.send("tradeInd", ["testAction"], 32);
};
