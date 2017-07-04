/* global console, document */
/* global Socket */

// BTW, we dont target older IE versions

var config = {
  serverAddr: "ympek.net:8020", // URI for game server,
  offlineMode: true // just for development
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

  document.getElementById('name-form').onsubmit = function (e) {
    e.preventDefault();
    var val = document.getElementById('name-input').value;

    Socket.sendString(val);
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