public class MessageDispatcher {

    PlayerManager playerManager;
    GameServer gameServer;

    MessageDispatcher(PlayerManager playerManager, GameServer gameServer){

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
        playerManager.getPlayer(hash).setName(name);

    }

    private void handleMessageActionInd(int hash, int keyId, double x, double y){
        playerManager.getPlayer(hash).handleMove(keyId, x, y);

    }
}
