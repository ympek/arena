package actions;
import playerData.PlayerContext;

/**
 * Created by Arkadiusz Nowak on 10.08.2018.
 */
abstract public class Effect {

    int power;
    int id;
    public int time;
    PlayerContext playerContext;

    Effect(PlayerContext playerContext){
        this.playerContext = playerContext;
    }

    public abstract void execute();
}
