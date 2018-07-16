import java.util.Random;

public class PlayerContext {

    String name;
    boolean ready;
    double targetX;
    double targetY;
    double positionX;
    double positionY;
    double prevPosX;
    double prevPosY;

    PlayerContext(String name){

        Random r = new Random();
        this.ready = true;
        this.name = name;
        this.positionX = (double)r.nextInt(GlobalSettings.MAP_SIZE_X - GlobalSettings.PLAYER_SIZE_X);
        this.positionY = (double)r.nextInt(GlobalSettings.MAP_SIZE_Y - GlobalSettings.PLAYER_SIZE_Y);
        this.targetX = positionX;
        this.targetY = positionY;
        this.prevPosX = this.positionX;
        this.prevPosY = this.positionY;
    }

    PlayerContext(PlayerContext source){

        this.name = source.name;
        this.ready = source.ready;
        this.positionX = source.positionX;
        this.positionY = source.positionY;
        this.prevPosX = source.prevPosX;
        this.prevPosY = source.prevPosY;
    }

    void handleMoveTest(double x, double y){

        if(!ready) return;

        targetX = x;
        targetY = y;

        GlobalSettings.print("Player target: X = " + targetX + "; target Y = " + targetY);
    }

    void move(){

        prevPosX = positionX;
        positionX = targetX;

        prevPosY = positionY;
        positionY = targetY;
    }

    void update(int frame){
        if(frame == 0){ //update once every second
            GlobalSettings.print("Player " + name + "position: x = " + positionX + "; y = " + positionY);
        }

    }

}

