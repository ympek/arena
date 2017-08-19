import data.MessageName;

public class MessageDispatcher {

    PlayerManager playerManager;
    GameServer gameServer;
    ProtocolEncoder protocolEncoder;

    MessageDispatcher(PlayerManager playerManager, GameServer gameServer, ProtocolEncoder protocolEncoder){
        this.protocolEncoder = protocolEncoder;
        this.playerManager = playerManager;
        this.gameServer = gameServer;
    }

    void handleMessage(int hash, MessageData messageData){
        if(GlobalSettings.traces){
            System.out.println("Message handled, id: " + messageData.getMessageId());
        }

        switch (messageData.getMessageId()) {
            case 0: handleMessageLoginReq(hash, messageData.getStringParameter("name").getValue());
                    break;
            case 1: handleMessageActionInd(hash,    messageData.getIntegerParameter("inputId").getValue(),
                                                    messageData.getDoubleParameter("absMouseCoordX").getValue(),
                                                    messageData.getDoubleParameter("absMouseCoordY").getValue());
                    break;
        }
    }

    private void handleMessageLoginReq(int hash, String name){
        MessageData response = new MessageData(0, "loginAck");
        if(playerManager.getPlayer(hash).setName(name)){
            response.addParameter("answerCode", 1);
        }
        else{
            response.addParameter("answerCode", 0);
        }
        gameServer.sendToPlayer(hash, protocolEncoder.encodeMessage(response));
    }

    private void handleMessageActionInd(int hash, int keyId, double x, double y){
        playerManager.getPlayer(hash).handleMove(keyId, x, y);

    }

}
