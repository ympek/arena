package logic;

/**
 * Created by Arkadiusz Nowak on 17.07.2018.
 */
public final class MessageBuilder {

    static final MessageData buildLoginAck(int objectId, String name){

        MessageData response = new MessageData(0, "loginAck");

        response.addParameter("objectId", objectId);
        response.addParameter("name", name);

        return response;
    }

    static final MessageData buildLoginRej(int answerCode, String responseString){

        MessageData response = new MessageData(1, "loginRej");

        response.addParameter("answerCode", answerCode);
        response.addParameter("responseString", responseString);

        return response;
    }

    static final MessageData buildMoveUpdateInd(int objectId, double absPositionCoordX, double absPositionCoordY,
                                            double absTargetCoordX, double absTargetCoordY, double objectSpeed){
        
        MessageData response = new MessageData(2, "moveUpdateInd");

        response.addParameter("objectId", objectId);
        response.addParameter("absPositionCoordX", absPositionCoordX);
        response.addParameter("absPositionCoordY", absPositionCoordY);
        response.addParameter("absTargetCoordX", absTargetCoordX);
        response.addParameter("absTargetCoordY", absTargetCoordY);
        response.addParameter("objectSpeed", objectSpeed);

        return response;
    }

    static final MessageData buildPlayerIntroInd(int objectId, String name, double positionX, double positionY, int health){

        MessageData response = new MessageData(3, "playerIntroInd");

        response.addParameter("objectId", objectId);
        response.addParameter("name", name);
        response.addParameter("positionX", positionX);
        response.addParameter("positionY", positionY);
        response.addParameter("health", health);

        return response;
    }

    static final MessageData buildPlayerLogoutInd(int objectId){

        MessageData response = new MessageData(4, "playerLogoutInd");

        response.addParameter("objectId", objectId);

        return response;
    }
}
