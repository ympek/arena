import GraphicsEngine from './GraphicsEngine';
import Config from './Config';
import ProtocolProvider from './interface/ProtocolProvider';
import Socket from './Socket';
import IPoint from './interface/IPoint';

// This is SUPER awkward, but... it's just first step to migrating to ts
// so for now - OK. Change it!
let ge: any;
let sock: any;
let canv = <HTMLCanvasElement>document.getElementById("arena-canvas");

sock = Socket();
// request anim frame bedzie wlasciwie tutaj
// handloweanie keypressow tutaj
// i posylanie przez socket dalej

declare const protocolProvider: ProtocolProvider

var handleKeyPress = function (ev: KeyboardEvent) {
  switch (ev.keyCode) {
    case 32: handleKeySpace(); break;
    case 81: handleKeyQ(); break;
    case 87: handleKeyW(); break;
    case 69: handleKeyE(); break;
    case 82: handleKeyR(); break;
  }
};

const handleKeySpace = function () {
  console.log('Handle Key: Space');
};

const handleKeyQ = function () {
  console.log('Handle Key: Q');
};

const handleKeyW = function () {
  console.log('Handle Key: W');
};

const handleKeyE = function () {
  console.log('Handle Key: E');
};

const handleKeyR = function () {
  console.log('Handle Key: R');
};


var getMousePos = function (evt: MouseEvent): IPoint {
  var rect = canv.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}


const attachEventListeners = function () {
  window.onresize = ge.adjustCanvasToWindow;
  document.onkeydown = handleKeyPress;
  canv.oncontextmenu = function (ev) {
    ev.preventDefault();
    let mousePos = getMousePos(ev);
    ge.handleRightClick(mousePos);
    // oprocz tego send to socket
    dispatchMessage(1, { // how can we make that they're not magic numbs
      inputId: 3, // right click
      absMouseCoordX: mousePos.x,
      absMouseCoordY: mousePos.y
    });
  };


};

const DOMElements = {
  canvasBox: <HTMLElement>document.getElementById("canvas-box"),
  namePrompt: <HTMLElement>document.getElementById("name-prompt"),
  logoDiv: <HTMLElement>document.getElementById("logodiv")
};

// loaded later in prepareGame from Provider;
// should be IIFE property.
var protocol;

if (document.readyState === "complete") {
  console.log("Does it even");
  prepareGame();
} else {
  document.addEventListener("DOMContentLoaded", prepareGame);
  console.log("Does it even work?");
  console.log(protocolProvider);

}

function loadProtocol() {
  return JSON.parse(protocolProvider.getProtocolSerialized());
}

function prepareGame() { // to sie wykonuje 1st.
  protocol = loadProtocol();
  console.log('Loaded protocol', protocol);

  sock.establishConnection(Config.serverAddr);
  document.addEventListener('conn.established', function () {
    registerSocketListener();
  });

  // add form listener to Join the battle form
  // later on we send msgId 0x00 which is loginReq
  // TODO : brzydkie!
  document.getElementById("name-form")!.onsubmit = function (e) {
    e.preventDefault();
    const nameInput = <HTMLInputElement>document.getElementById("name-input");
    var val = nameInput.value;

    dispatchMessage(0, {
      name: val.trim()
    });
  };
  ge = GraphicsEngine(canv);
  attachEventListeners(); // korzysta z ge, moze to jakos ladniej sie da
  ge.run();
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
      return true;
    });

    if (numericId === -1) {
      console.error('Message identifier' + msgId + 'not found in protocol.');
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
    paramsMap[param.name].name = param.name;
    paramsMap[param.name].size = param.size;
    paramsMap[param.name].type = param.type;
  }); // taka odwrotna tablica

  console.log('paramsMap', paramsMap);

  const paramsArray: any[] = [];
  for (var key in params) {
    if (params.hasOwnProperty(key)) {
      paramsMap[key].value = params[key];

      var idx = paramsMap[key].index;
      paramsArray[idx] = paramsMap[key];
    }
  }

  console.log('paramsArray', paramsArray);

  sock.send(msgId, paramsArray);
}

interface WindowEventMap {
  DataRecv: CustomEvent
}

function registerSocketListener() {
  document.addEventListener('data.received', function (ev: Event) {
    var msg = decodeByProtocol((<CustomEvent>ev).detail);
    // dupny switch
    switch (msg._name) {
      case "loginAck":
        showArenaCanvas();
        console.log("Handling loginAck: login successful. Msg: ", msg);
        ge.saveCurrentPlayerId(msg.objectId);
        // save userId for future use.
        break;
      case "loginRej":
        console.log("Login rejected. Error.", msg);
        break;
      case "playerIntroInd":
        // osluga tego msg bedzie polegac na
        // dodaniu gracza do wewnetrznej listy graczy
        // tylko kto ma trzymac se te liste? ge?
        console.log('Player introduction.', msg);
        ge.addPlayer(msg.objectId, msg.positionX, msg.positionY, msg.health);
        break;
      case "moveUpdateInd":
        console.log("move Update.", msg.objectId);
        break;
      default:
        console.log("Unknown msg", msg);
    }
  });
}

function showArenaCanvas() {
  // this i remember was done fast and ugly.
  // FIXME.
  DOMElements.namePrompt.style.display = 'none';
  DOMElements.logoDiv.style.display = 'none';
  DOMElements.canvasBox.style.display = 'block';
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

  //console.log("Received message:", receivedMsg.messageName);

  var currentView;
  var decodedMsg: any = {};
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
    if (param.type == "string") {
      console.log("Decoded string. TODO");
    }
    offset += param.size / 8;
  });
  //console.log("Decoded Msg: ", decodedMsg);
  decodedMsg._name = receivedMsg.messageName;
  return decodedMsg;
}