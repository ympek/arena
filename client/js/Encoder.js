/* exported Socket */
/* global  console, ArrayBuffer, DataView, Uint8Array */


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
        messageName: "test01",
        messageParameters: [
            {
                name: "test_param",
                size: 8,
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


var Encoder = (function (protocol) {
  "use strict";
  var msgIdSize,
      clientTypes;

  var init = function() {
    // prepare protocol to be actually usable
    msgIdSize = protocol.messageIdSize;
    clientTypes = protocol.clientToServerMessage.messageTypes;

    // map clientTypes human-readable names to ints.
  };

  var encode = function(type, params) {
    var typeID;

    if (typeof type === "string") {
      // przetlumacz string na typ numeryczny
      typeID = 0; // for now
    } else if (typeof type === "number" && type % 1 === 0) {
      typeID = type;
    } else {
      console.log("Invalid message type. Message not sent.");
      return false;
    }
    // ensure proper types before assign?
    var binaryParams = params.map(function(paramValue, index) {
      // mapping params to bytes or so
      // what is this abomination
      var paramType = clientTypes[typeID].messageParameters[index].type,
          paramSize = clientTypes[typeID].messageParameters[index].size;
      console.log(paramType, paramSize);
      // mamy 3 paramsy: string, int, double.
      // string tlumaczy sie na uint8array z charkodami
      // int na int8 podejrzewam
      // double na setFloat64

      // TODO make it ladnie, make it factory
      var outBuf;
      switch (paramType) {
        case "double":
          outBuf = binarizeFloat(paramSize, paramValue);
          break;
        case "string":
          outBuf = binarizeString(paramSize, paramValue);
          break;
        case "int":
          outBuf = binarizeInt(paramSize, paramValue);
          break;
        default:
        // do nothing
      }
      return {
        size: paramSize,
        bytes: outBuf
      }; // i czuje ze to jest arrayBuffer co nie/
    });
    console.log('Ej tu', binaryParams);

    // build/encode params
    var msgSize = msgIdSize;

    /// I cant use .reduce 'cause it will return object when there's just one element...
    for (var i = 0; i < binaryParams.length; i++) {
        console.log(binaryParams[i]);
        msgSize += binaryParams[i].size;
    }  

    // mamy rzekomo msgSize
    console.log("Niby size:", msgSize)
    var bytesToSend = new Uint8Array(msgSize);
    // teraz musimy wpisac do tej zmiennej rzeczy... no i nie bardzo wiem jak.
    // teraz moze zrownam to wszystko do czegokolwiek

    // wiadomo na poczatku id
    var caret = 0;
    bytesToSend[caret] = typeID;
    caret++;
    console.log("bytesToSend", bytesToSend);
    
    // potem parametry
    binaryParams.forEach(function(paramBytes) {
      // treat as bytes
      var currParam = new Uint8Array(paramBytes.bytes);
      // i teraz bedzie size / 8 bajtow - de facto musze moc tu wyciagnac size z obiektu
      var numBytes = paramBytes.size / 8;
      for (var i = 0; i < numBytes; i++) {
        bytesToSend[caret] = currParam[i];
        caret++;
      }
    });

    // send via ws
    // sock.send(bytesToSend);
    return bytesToSend;
  };

  // potrzebujemy funkcji mapujacych size + wartosc na ArrayBuffer
  function binarizeString(size, value) { console.log("Binarize String")
    // mozliwe ze bd tu mogl/musial uzywac ArrayBuffer.transfer
    console.log("YO", size, value);
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

  return {
      init: init,
    encode: encode
  };
})(protocol);