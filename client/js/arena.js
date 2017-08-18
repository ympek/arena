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
function sendBinaryString(value) {
  
  var len = 64;
  var buf = new ArrayBuffer(len + 1);
  var bufView = new Uint8Array(buf);
  bufView[0] = 0;
  for (var i = 1; i <= len; i++) {
    console.log(i);
    if (value.charCodeAt(i-1)) {
      bufView[i] = value.charCodeAt(i-1);        
    } else {
      bufView[i] = 0;
    }
  }

  Socket.sendString(buf);

}

function testEncoder(encoder) {
  "use strict";
  console.log('Bd testowac');
  encoder.init();
  var bytes = encoder.encode(1, ["dupa"]); // zawsze trzeba bd to podawac jako tablice? nie rob tak
  console.log('Oto bajty DUPCIA:', bytes);




  function binarizeString(size, value) { console.log("Binarize String")
    var buf = new ArrayBuffer(size);
    var bufView = new Uint8Array(buf);
    for (var i = 0, len = value.length; i < len; i++) {
      bufView[i] = value.charCodeAt(i);
    }
    return {
      size: size,
      buffer: buf
    };
    // rzeczy sa w buforze, wiec view juz  jest nie potrzebny, logiczne.
    // sock.send(bufView);
    // pytanie czy nie beda sie wysylac jakies jebane smieci.
  }

  function binarizeFloat(size, value) { console.log("Binarize Float")
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

  function binarizeInt(size, value) { console.log("Binarize int")
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

  var obj = binarizeString(16, "11szymon");
  var obj2 = binarizeInt(1, 564);

  console.log('co jest', obj);

  var bufView = new Uint8Array(obj.buffer);
  var bufView2 = new Int8Array(obj2.buffer);



  console.log('view', bufView)
  console.log('vie2w', bufView2, bufView2.buffer);
  document.addEventListener('conn.established', function () {
    // Socket.sendString(obj.buffer);
    // Socket.sendString()
    sendBinaryString("abc");
  });
}

function prepareGame() {
  "use strict";
  DOMElements.preloader.innerHTML = "Preparing game...";

  if (!config.offlineMode) {
    Socket.establishConnection(config.serverAddr);
  } else {
    Socket.establishConnection(config.serverAddr);    
    testEncoder(Encoder);
  }

  document.getElementById('name-form').onsubmit = function (e) {
    e.preventDefault();
    var val = document.getElementById('name-input').value;
    Encoder.init();
    var bytes = Encoder.encode("string", val);
    // Socket.send
    console.log('TU bajty nowe', bytes);

    // Socket.sendString(val);
    sendBinaryString(val);
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