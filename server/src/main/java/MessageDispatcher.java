import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

public class MessageDispatcher {

    ArrayList<PlayerContext> players;
    Set<String> playersNames;
    PlayerContext testPlayer;

    MessageDispatcher(){
        players = new ArrayList<>();
        playersNames = new HashSet<>();
    }

    void handleMessage(MessageData messageData){
        if(GlobalSettings.traces){
            System.out.println("Message handled, id: " + messageData.getMessageId());
        }
        if(messageData.getMessageId() == 0){
            if(playersNames.add(messageData.getStringParameter("name").getValue())){
                players.add(new PlayerContext(messageData.getStringParameter("name").getValue()));
            }
            if(GlobalSettings.traces) {
                for (int i = 0; i<players.size(); i++){
                    System.out.println(players.get(i).name);
                }
            }
        }
        else if(messageData.getMessageId() == 1){
            testPlayer = new PlayerContext("SzympegPedau");
            testPlayer.handleMove(  messageData.getIntegerParameter("inputId").getValue(),
                                    messageData.getDoubleParameter("absMouseCoordX").getValue(),
                                    messageData.getDoubleParameter("absMouseCoordY").getValue());
        }
    }


}
