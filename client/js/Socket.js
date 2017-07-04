/* exported Socket */

// todo: move protocol somewhere else - load as json
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

// socket gets the protocol specification as a parameter,
// so it knows how to send stuff
var Socket = (function(protocol) {
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

  var getMessageIdByName = function(msgName) {
    var len = protocol.clientToServerMessage.messageTypes.length;
    for (var i = 0; i < len; i++) {
      if (
        protocol.clientToServerMessage.messageTypes[i].messageName === msgName
      ) {
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

  var calculateMsgLength = function(msgName) {
    // in bytes
    var len = 0;
    len += protocol.messageIdSize;
    // tu bd liczyc
  };

  var send = function(msgName, params) {
    sock.send("Pedal");
    // encode
    var msg = "";
    var id = getMessageIdByName(msgName);
    msg += id;

    msg += "dupa";

    // actually send
    // pytanie czy big czy little endian
    console.log(msg);
    var buf = new ArrayBuffer(64);
    var dataView = new DataView(buf);
    dataView.setFloat64(0, 544.1);

    // sock.send(msg.buffer);
    sock.send(dataView);
  };

  var sendString = function(str) {
    sock.send("Leci string jako binarka");
    // var buf = new ArrayBuffer(64);
    // var encoder = new TextEncoder("utf-8");
    // var stringBytes = encoder.encode("Szymon");
  };

  var preparePacket = function() {
    // messageID
  };

  var sendFloat = function(number) {};

  // wlasciwie to bd takie factory
  var buildMessage = function(msgType) {
    // ustal msgType, wez jaka to ma wielkosc
    var idSize = 8;
    var id = 1;
    var idBuffer = new ArrayBuffer(idSize);
    var idView = new DataView(idBuffer);
    var msgParams = [];
    idView.setUint8(0, id);
    // id mamy tu wrzucone, teraz co tam dalej.
    // funkcja ktora nam zmapuje parameters => bajty
    var binaryParams = msgParameters.map(function mapParamsToBytes(el, i) {
      var paramBuf = new ArrayBuffer(el.size);
      // mamy 3 paramsy: string, int, double.
      // string tlumaczy sie na uint8array z charkodami
      // int na int8 podejrzewam
      // double na setFloat64

      // TODO make it ladnie, make it factory
      switch (el.type) {
        case "double":
          var outBuf = binarizeFloat(el.size);
          break;
        case "string":
          var outBuf = binarizeString(el.size);
          break;
        case "int":
          var outBuf = binarizeInt(el.size);
          break;
        default:
        // do nothing
      }
      return outBuf; // i czuje ze to jest arrayBuffer co nie/
    });

    // teraz trzeba skonkatenowac te rzeczy.
    var msgSize = idSize + binaryParams.reduce(function (prev, next) {
      return prev.length + next.length;
    });
    // mamy rzekomo msgSize
    var bytesToSend = new Uint8Array(msgSize);
    // teraz musimy wpisac do tej zmiennej rzeczy... no i nie bardzo wiem jak.
    // teraz moze zrownam to wszystko do czegokolwiek
    // wiadomo na poczatku id
    var caret = 0;
    bytesToSend[caret] = id;
    caret++;
    binaryParams.forEach(function (paramBytes, index) {
      // treat as bytes
      var currParam = new Uint8Array(paramBytes.buffer);
      // i teraz bedzie size / 8 bajtow - de facto musze moc tu wyciagnac size z obiektu
      var numBytes = paramBytes.size / 8;
      for (var i = 0; i < numBytes; i++) {
        bytesToSend[caret] = currParam[i];
        caret++;
      }
    });
  };

  // potrzebujemy funkcji mapujacych size + wartosc na ArrayBuffer
  function binarizeString(size, value) {
    // mozliwe ze bd tu mogl/musial uzywac ArrayBuffer.transfer
    var buf = new ArrayBuffer(size);
    var bufView = new Uint8Array(buf);
    for (var i = 0, len = value.length; i < len; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf; // rzeczy sa w buforze, wiec view juz  jest nie potrzebny, logiczne.
    // sock.send(bufView);
    // pytanie czy nie beda sie wysylac jakies jebane smieci.
  }

  function binarizeFloat(size, value) {
    var buf = new ArrayBuffer(size);
    var dataView = new DataView(buf);
    dataView.setFloat64(0, value);
    // sock.send(msg.buffer);
    // sock.send(dataView);
    return buf;
  }

  function binarizeInt(size, value) {
    // tylko ze tutaj zakladam de facto ze kazdy int bedzie 8
    var buf = new ArrayBuffer(size);
    var dataView = new DataView(buf);
    dataView.setInt8(0, value);
    // sock.send(msg.buffer);
    // sock.send(dataView);
    return buf;
  }

  return {
    establishConnection: establishConnection,
    send: send,
    sendString: sendString
  };
})(protocol);
