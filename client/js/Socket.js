// js hint options:
/* exported Socket */
/* global WebSocket, console, ArrayBuffer, DataView, Uint8Array */

// socket gets the protocol specification as a parameter,
// so it knows how to send stuff
var Socket = (function() {
  "use strict";
  var sock;

  var establishConnection = function(addr) {
    sock = new WebSocket("ws://" + addr);
    sock.binaryType = "arraybuffer"; // we encode msgs as binary / is this neccessary

    sock.onopen = function(ev) {
      console.log("Connection established." + ev.data);
      // sock.send("Opening!");
      var newEv = new CustomEvent('conn.established', {});
      document.dispatchEvent(newEv);
    };

    sock.onmessage = function(ev) {
      console.log("recv data.");
      console.log(ev.data);
    };
  };

  var sendString = function(str) {
    sock.send(str);
  };

  // high-level function: send message of specific type and with params
  // type could be message name if string and index if number
  // params are array of parameters and the ordering is important
  // TODO: can be a map (dictionary) too.
  var send = function () {
    // Tu wszystko i tak jest singletonem wiec nie musze chyba robic zadnego containera DI.
    Encoder.encode();
  };

  return {
    establishConnection: establishConnection,
    sendString: sendString,
    send: send
  };
})();
