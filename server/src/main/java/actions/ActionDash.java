package actions;

import logic.GlobalSettings;
import logic.Room;
import playerData.ROPlayerStats;

/**
 * Created by Arkadiusz Nowak on 12.08.2018.
 */
public class ActionDash extends Action {

    private double targetNormalX;
    private double targetNormalY;
    private int time;

    public ActionDash(int hash, Room room, double targetX, double targetY){
        super(hash, room);
        this.targetNormalX = targetX;
        this.targetNormalY = targetY;
        this.isActive = true;

        time = 10;
    }

    @Override
    public void execute() {

        if(!isActive) return;

        //==============================================================================================================
        // 1. Wektor od pozycji do celu
        // 2. Wyliczamy długość wektora
        // 3. Normalizujemy!!!!!!!
        // 4. Mnożymy przez prędkość
        // 5. Dodajemy do pozycji

        // 1-3 w pierwszym kroku, 4-5 w każdym
        //==============================================================================================================

        ROPlayerStats player = room.playersActionStats.get(playerHash);

        if(time == 10) {
            //1.
            targetNormalX =- player.x;
            targetNormalY =- player.y;

            //2.
            double vectLen = Math.sqrt(targetNormalX * targetNormalX + targetNormalY * targetNormalY);

            //3.
            targetNormalX = (targetNormalX / vectLen);
            targetNormalY = (targetNormalY / vectLen);
        }
        //4.
        double vectX = targetNormalX * (3*player.speed/ GlobalSettings.MAX_FPS);
        double vectY = targetNormalY * (3*player.speed/ GlobalSettings.MAX_FPS);

        //5.
        room.players.get(playerHash).paramEffects.add(new EffectMove(room.players.get(playerHash), vectX, vectY));

        player.hasControl = false;

        if(--time == 0){
            isActive = false;
            isAlive = false;
            player.hasControl = true;
        }
    }
}
