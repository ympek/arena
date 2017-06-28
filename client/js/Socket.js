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
var Socket = (function (protocol) {
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

  var calculateMsgLength = function (msgName) { // in bytes
    var len = 0;
    len += protocol.messageIdSize;
    // tu bd liczyc
  };

  var send = function(msgName, params) {
    sock.send("Pedal");
    // encode
    var msg = '';
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
    var buf = new ArrayBuffer(str.length); // 2 bytes for each char
    var bufView = new Uint8Array(buf);
    for (var i=0, strLen=str.length; i<strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    sock.send(bufView);
  }

  return {
    establishConnection: establishConnection,
    send: send,
    sendString: sendString
  };
})(protocol);

