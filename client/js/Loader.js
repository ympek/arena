var Loader = (function () {
    
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

      var loadProtocol = function () {
          return protocol;
      };

    return {
        loadProtocol: loadProtocol
    };
})();