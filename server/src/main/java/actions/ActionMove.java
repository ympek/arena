package actions;

import logic.GlobalSettings;
import logic.Room;
import playerData.PlayerContext;
import playerData.ROPlayerStats;

/**
 * Created by Arkadiusz Nowak on 11.08.2018.
 */
public class ActionMove extends Action {

    public double targetX;
    public double targetY;
    private ROPlayerStats player;

    public ActionMove(int hash, Room room, ROPlayerStats player, double targetX, double targetY, boolean isActive){
        super(hash, room);
        this.player = player;
        this.targetX = targetX;
        this.targetY = targetY;
        this.isActive = isActive;
    }

    @Override
    public void execute() {

        if(!isActive) return;

        //==============================================================================================================
        // 1. Wektor od pozycji do celu
        // 2. Wyliczamy długość wektora
        // 3. Normalizujemy
        // 4. Mnożymy przez prędkość
        // 5. Dodajemy do pozycji
        //==============================================================================================================

        //ROPlayerStats player = room.playersActionStats.get(playerHash);

        if(!player.hasControl) return;

        //1.
        double vectX = targetX - player.x;
        double vectY = targetY - player.y;

        if(vectX == 0 && vectY == 0) {
            isActive = false;
            isAlive = false;
            return;
        }

        //2.
        double vectLen = Math.sqrt(vectX*vectX + vectY*vectY);

        //3. 4.
        vectX = (vectX/vectLen) * (player.speed/ GlobalSettings.MAX_FPS);
        vectY = (vectY/vectLen) * (player.speed/ GlobalSettings.MAX_FPS);

        //5.
        room.players.get(playerHash).paramEffects.add(new EffectMove(room.players.get(playerHash), vectX, vectY));
    }
}
