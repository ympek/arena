/* exported Socket */
/* global WebSocket, console, ArrayBuffer, DataView, Uint8Array */

// socket gets the protocol specification as a parameter,
// so it knows how to send stuff
interface MessageFragment {
    size : number,
    buffer: ArrayBuffer,
    view?: any // doczepiany view by obsluzyc legacy feature. Do ew. refactoringu TODO
}

interface BinarizeFunction {
    (size : number, value : any) : MessageFragment
}

export default function Socket() {
    let sock;
  
    var establishConnection = function(addr) {
      sock = new WebSocket("ws://" + addr);
      sock.binaryType = "arraybuffer";
  
      sock.onopen = function(ev) {
        console.log("Socket.js: connection established.");
        var newEv = new CustomEvent('conn.established', {});
        document.dispatchEvent(newEv);
      };
  
      sock.onmessage = function(ev) {
        //console.log('REceived data from server. Details:', ev.data)
        var newEv = new CustomEvent('data.received', {
          detail: ev.data
        });
  
        document.dispatchEvent(newEv);
      };
    };
  
    var send = function(messageId : number, paramsArray : any[]) {
      var buf : ArrayBuffer = encode(messageId, paramsArray);
      console.log("Trying to send message");
      if (buf.constructor !== ArrayBuffer) {
        console.error("Failed to encode message. Message not sent.");
      } else {
        sock.send(buf);
      console.log("Message shoulbe send.");
      }
    }
  
    return {
      establishConnection: establishConnection,
      send: send
    };
  };
  
  // Encoder Stuff
  
  function encode(msgId, paramsArray) {
    var byteData : MessageFragment[] = [];
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
  
  // Binarize function factory.
  function getBinarizeFunc(type : string) : BinarizeFunction {
    switch(type) {
      case "int":
        return binarizeInt;
      case "float":
      case "double":
        return binarizeFloat;
      case "string":
        return binarizeString;
      default:
        return invalidBinarizeFunction;
    }
  }
  
  function binarizeString(size : number , value : string) {
    let buf = new ArrayBuffer(size);
    let bufView = new Uint8Array(buf);
    // fails for non-ascii i guess.
    for (var i = 0, len = value.length; i < len; i++) {
      bufView[i] = value.charCodeAt(i);
    }
    
    return {
      size: size,
      buffer: buf
    };
  }
  
  function binarizeFloat(size : number, value : number) {
    let buf = new ArrayBuffer(size);
    let dataView = new DataView(buf);
    dataView.setFloat64(0, value);
  
    return {
      size: size,
      buffer: buf
    };
  }
  
  function binarizeInt(size : number, value : number) {
    // tylko ze tutaj zakladam de facto ze kazdy int bedzie 8
    let buf = new ArrayBuffer(size);
    let dataView = new DataView(buf);
    dataView.setInt8(0, value);
  
    return {
      size: size,
      buffer: buf
    };
  }
  
  function invalidBinarizeFunction(size : number, value : number) {
      console.error("Invalid binarize function was called. Params: size :", size, "Value: ", value);

      return {
          size: 0,
          buffer: new ArrayBuffer(0)
      }
  }