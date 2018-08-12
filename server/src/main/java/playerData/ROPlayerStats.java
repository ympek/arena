package playerData;

/**
 * Created by Arkadiusz Nowak on 12.08.2018.
 */
public class ROPlayerStats {

    public double x, y, speed;
    public int health;
    public boolean hasControl;

    ROPlayerStats(int hp, double x, double y, double speed, boolean control){
        this.health = hp;
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.hasControl = control;
    }

}
