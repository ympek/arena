import java.util.HashMap;
import java.util.Map;
import java.util.Random;

public class PlayerManager {

    Map<Integer, PlayerContext> playerContextMap;

    PlayerManager(){
        playerContextMap = new HashMap<>();
    }

    public void addPlayer(int hash){
        GlobalSettings.print("Add player with hash: " + hash);
        Random r = new Random();
        playerContextMap.put(hash, new PlayerContext("",  (double)r.nextInt(GlobalSettings.MAP_SIZE_X - GlobalSettings.PLAYER_SIZE_X),
                                                                (double)r.nextInt(GlobalSettings.MAP_SIZE_Y - GlobalSettings.PLAYER_SIZE_Y)));
    }

    public void removePlayer(int hash){
        GlobalSettings.print("Remove player with hash: " + hash);
        playerContextMap.remove(hash);
    }

    public PlayerContext getPlayer(int hash){

        return playerContextMap.get(hash);
    }

    public boolean checkName(String name){
        for (PlayerContext p:playerContextMap.values()) {
            if(p.name.equals(name)) return false;
        }
        return true;
    }
}
