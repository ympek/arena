import java.util.HashMap;
import java.util.Map;

public class PlayerManager {

    Map<Integer, PlayerContext> playerContextMap;

    PlayerManager(){
        playerContextMap = new HashMap<>();
    }

    public void addPlayer(int hash){
        GlobalSettings.print("Add player with hash: " + hash);
        playerContextMap.put(hash, new PlayerContext(""));
    }

    public void removePlayer(int hash){
        GlobalSettings.print("Remove player with hash: " + hash);
        playerContextMap.remove(hash);
    }

    public PlayerContext getPlayer(int hash){

        return playerContextMap.get(hash);
    }

}
