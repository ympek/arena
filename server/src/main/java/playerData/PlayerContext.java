package playerData;

import actions.Action;
import actions.ActionMove;
import actions.Effect;
import logic.GlobalSettings;

import java.util.LinkedList;
import java.util.Random;

public class PlayerContext {

    public int id;
    public String name;
    public boolean vip;
    public boolean ready;
    public boolean isAlive;

    public ROPlayerStats stats;

    public ActionMove moveAction;
    public LinkedList<Action> actions;
    public LinkedList<Effect> statusEffects;
    public LinkedList<Effect> paramEffects;

    // Synchronized -> dane zapisywane przez główny wątek
    public double targetX;
    public double targetY;

    // Dane zapisywane w pętli
    public double prevPosX;
    public double prevPosY;

    public PlayerContext(int id, String name, boolean vip){

        this.id = id;

        this.ready = true;
        this.isAlive = true;
        this.name = name;
        this.vip = vip;

        this.actions = new LinkedList<>();
        this.statusEffects = new LinkedList<>();
        this.paramEffects = new LinkedList<>();


        Random r = new Random();
        this.stats = new ROPlayerStats(200, (double)r.nextInt(GlobalSettings.MAP_SIZE_X - GlobalSettings.PLAYER_SIZE_X),
                                                (double)r.nextInt(GlobalSettings.MAP_SIZE_Y - GlobalSettings.PLAYER_SIZE_Y),
                                    200, true);
        this.moveAction = new ActionMove(-1, null, this, 0, 0,false);

        this.targetX = this.stats.x;
        this.targetY = this.stats.y;

        this.prevPosX = this.stats.x;
        this.prevPosY = this.stats.y;
    }

    public void update(int frame){
        if(frame == 0){ //update once every second
            GlobalSettings.print("Player " + name + " position: x = " + stats.x + "; y = " + stats.y);
        }

    }
}

