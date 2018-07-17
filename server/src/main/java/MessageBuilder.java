/**
 * Created by Arkadiusz Nowak on 17.07.2018.
 */
public final class MessageBuilder {

    static final MessageData buildLoginAck(int answerCode, int spawnX, int spawnY){

        MessageData response = new MessageData(0, "loginAck");

        response.addParameter("answerCode", answerCode);
        response.addParameter("spawnX", spawnX);
        response.addParameter("spawnY", spawnY);

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
}
