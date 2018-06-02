var Loader = (function () {

  var loadProtocol = function () {
    return JSON.parse(ProtocolProvider.getProtocol());
  };

  return {
    loadProtocol: loadProtocol
  };
})();
