import java.util.Random;

public class PlayerContext {

    int id;
    String name;
    boolean vip;
    boolean ready;

    // Synchronized -> dane zapisywane przez główny wątek
    double targetX;
    double targetY;

    // Dane zapisywane w pętli
    double positionX;
    double positionY;
    double prevPosX;
    double prevPosY;

    int health;
    double speed;

    PlayerContext(int id, String name, boolean vip){

        this.id = id;
        Random r = new Random();

        this.ready = true;
        this.name = name;
        this.vip = vip;

        this.positionX = (double)r.nextInt(GlobalSettings.MAP_SIZE_X - GlobalSettings.PLAYER_SIZE_X);
        this.positionY = (double)r.nextInt(GlobalSettings.MAP_SIZE_Y - GlobalSettings.PLAYER_SIZE_Y);

        this.targetX = positionX;
        this.targetY = positionY;

        this.prevPosX = this.positionX;
        this.prevPosY = this.positionY;

        this.health = 200;
        this.speed = 100;
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

        GlobalSettings.print("Player "+ name +" target: X = " + targetX + "; target Y = " + targetY);
    }

    void move(){

        prevPosX = positionX;
        prevPosY = positionY;

        //==============================================================================================================
        // 1. Wektor od pozycji do celu
        // 2. Wyliczamy długość wektora
        // 3. Normalizujemy
        // 4. Mnożymy przez prędkość
        // 5. Dodajemy do pozycji
        //==============================================================================================================

        //1.
        double vectX = targetX - positionX;
        double vectY = targetY - positionY;

        //2.
        double vectLen = Math.sqrt(vectX*vectX + vectY*vectY);

        //3. 4.
        vectX = (vectX/vectLen) * (this.speed/GlobalSettings.MAX_FPS);
        vectY = (vectY/vectLen) * (this.speed/GlobalSettings.MAX_FPS);

        //5.
        positionX += vectX;
        positionY += vectY;

    }

    void update(int frame){
        if(frame == 0){ //update once every second
            GlobalSettings.print("Player " + name + " position: x = " + positionX + "; y = " + positionY);
        }

    }

}

