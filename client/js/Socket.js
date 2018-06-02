/t/ js hint options:
/* exported Socket */
/* global WebSocket, console, ArrayBuffer, DataView, Uint8Array */

// socket gets the protocol specification as a parameter,
// so it knows how to send stuff
var Socket = (function() {
  "use strict";
  var sock;

  var establishConnection = function(addr) {
    sock = new WebSocket("ws://" + addr);
    sock.binaryType = "arraybuffer";

    sock.onopen = function(ev) {
      console.log("Socket.js: connection established.");
      var newEv = new CustomEvent('conn.established', {});
      document.dispatchEvent(newEv);
    };

    sock.onmessage = function(ev) {
      console.log("recv data:");
      console.log(ev);
      var d = ev.data;
      console.log('aaaa', d.toString());

      var newEv = new CustomEvent('data.received', {
        detail: ev.data
      });

      document.dispatchEvent(newEv);
    };
  };


  // high-level function: send message of specific type and with params
  // type could be message name if string and index if number
  // params are array of parameters and the ordering is important
  // TODO: can be a map (dictionary) too.
    // Tu wszystko i tak jest singletonem wiec nie musze chyba robic zadnego containera DI.
    // sock

  var send = function(messageId, paramsArray) {
    var buf = encode(messageId, paramsArray);

    if (buf.constructor !== ArrayBuffer) {
      console.error("Failed to encode message. Message not sent.");
    } else {
      sock.send(buf);
    }
  }

  return {
    establishConnection: establishConnection,
    send: send
  };
})();

// Encoder Stuff

function encode(msgId, paramsArray)
{
  var byteData = [];
  var sizeInBytes = 1;

  paramsArray.forEach(function (param, index) {
    var binaryOut = getBinarizeFunc(param.type)(param.size, param.value);
    byteData[index] = binaryOut;
    byteData[index].view = new Uint8Array(binaryOut.buffer);
    sizeInBytes += binaryOut.size/8;
  });

  var bufAll = new ArrayBuffer(sizeInBytes);
  var bufView = new Uint8Array(bufAll);
  bufView[0] = msgId;
  var globCounter = 1;

  byteData.forEach(function (bd, index) {
    for (var i = 0; i < bd.size/8; i++) {
      bufView[globCounter] = bd.view[i];
      globCounter++;
    }
  });

  return bufAll;
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
