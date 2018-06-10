public class MessageDispatcher {

    PlayerManager playerManager;
    GameServer gameServer;
    ProtocolEncoder protocolEncoder;

    MessageDispatcher(PlayerManager playerManager, GameServer gameServer, ProtocolEncoder protocolEncoder) {
        this.protocolEncoder = protocolEncoder;
        this.playerManager = playerManager;
        this.gameServer = gameServer;
    }

    void handleMessage(int hash, MessageData messageData) {
        if (GlobalSettings.traces) {
            System.out.println("Message handled, id: " + messageData.getMessageId());
        }

        switch (messageData.getMessageId()) {
            case 0:
                handleMessageLoginReq(hash, messageData.getStringParameter("name").getValue());
                break;
            case 1:
                handleMessageActionInd(hash, messageData.getIntegerParameter("inputId").getValue(),
                        messageData.getDoubleParameter("absMouseCoordX").getValue(),
                        messageData.getDoubleParameter("absMouseCoordY").getValue());
                break;
        }
    }

    private void handleMessageLoginReq(int hash, String name) {

        MessageData response;
        System.out.println("handlingMessageLoginReq");
        if (!playerManager.checkName(name)) {
            response = new MessageData(1, "loginRej");
            response.addParameter("answerCode", 0);
            response.addParameter("responseString", "Player already exist!");
        } else if (name.equals("pedau")) {
            response = new MessageData(1, "loginRej");
            response.addParameter("answerCode", 1);
            response.addParameter("responseString", "Nie chcemy tu pedalow!");
        } else {
            response = new MessageData(0, "loginAck");
            if (playerManager.getPlayer(hash).setName(name)) {
                response.addParameter("answerCode", 1);
            } else {
                response.addParameter("answerCode", 0);
            }
            //kod z ustawianiem spawnu
            response.addParameter("spawnX", (int)playerManager.getPlayer(hash).positionX);
            response.addParameter("spawnY", (int)playerManager.getPlayer(hash).positionY);
        }

        gameServer.sendToPlayer(hash, protocolEncoder.encodeMessage(response));

    }

    private void handleMessageActionInd(int hash, int keyId, double x, double y) {
        playerManager.getPlayer(hash).handleMove(keyId, x, y);

    }

}
