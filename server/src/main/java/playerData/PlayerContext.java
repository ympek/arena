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
    public long dashCooldown;

    public LinkedList<Action> actions;
    public LinkedList<Effect> statusEffects;
    public LinkedList<Effect> paramEffects;

    public long respawnTime;

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

        this.respawnTime = 0;
        this.dashCooldown = 0;

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

    public void kill(){
        this.isAlive = false;
        this.stats.hasControl = false;
        this.stats.x = -1;
        this.stats.y = -1;
        this.respawnTime = System.currentTimeMillis() + 30*1000;
        this.moveAction.isActive = false;
    }

    public void respawn(){
        Random r = new Random();
        this.isAlive = true;
        this.stats.hasControl = true;
        this.stats.health = 200;
        this.stats.speed = 200;
        this.stats.x = (double)r.nextInt(GlobalSettings.MAP_SIZE_X - GlobalSettings.PLAYER_SIZE_X);
        this.stats.y = (double)r.nextInt(GlobalSettings.MAP_SIZE_Y - GlobalSettings.PLAYER_SIZE_Y);

        this.targetX = this.stats.x;
        this.targetY = this.stats.y;

        this.prevPosX = this.stats.x;
        this.prevPosY = this.stats.y;

        this.moveAction.targetX = this.stats.x;
        this.moveAction.targetY = this.stats.y;
    }
}

