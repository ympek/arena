package actions;
import logic.Room;
import playerData.PlayerContext;

import java.util.ArrayList;
import java.util.Map;

/**
 * Created by Arkadiusz Nowak on 11.08.2018.
 */
abstract public class Action {

    int playerHash;
    Room room;
    public boolean isActive;
    public boolean isAlive;

    Action(int hash, Room room){
        playerHash = hash;
        this.room = room;
        isAlive = true;
    }

    abstract public void execute();
}
