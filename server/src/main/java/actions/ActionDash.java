package actions;

import logic.GlobalSettings;
import logic.Room;
import playerData.PlayerContext;
import playerData.ROPlayerStats;

import java.util.Map;

/**
 * Created by Arkadiusz Nowak on 12.08.2018.
 */
public class ActionDash extends Action {

    private double targetNormalX;
    private double targetNormalY;
    private int time;
    private boolean dmged;

    public ActionDash(int hash, Room room, double targetX, double targetY){
        super(hash, room);
        this.targetNormalX = targetX;
        this.targetNormalY = targetY;
        this.isActive = true;
        this.dmged = false;

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
            targetNormalX -= player.x;
            targetNormalY -= player.y;

            //2.
            double vectLen = Math.sqrt(targetNormalX * targetNormalX + targetNormalY * targetNormalY);

            //3.
            targetNormalX = (targetNormalX / vectLen);
            targetNormalY = (targetNormalY / vectLen);
        }
        //4.
        double vectX = targetNormalX * (4*player.speed/ GlobalSettings.MAX_FPS);
        double vectY = targetNormalY * (4*player.speed/ GlobalSettings.MAX_FPS);

        //5.
        room.players.get(playerHash).paramEffects.add(new EffectMove(room.players.get(playerHash), vectX, vectY));

        //collision check for damage purpose

        for(Map.Entry<Integer, ROPlayerStats> playerStatsEntry : room.playersActionStats.entrySet()) {
            if (playerStatsEntry.getKey() == playerHash) continue;
            double distance = Math.sqrt((player.x + vectX - playerStatsEntry.getValue().x) * (player.x + vectX - playerStatsEntry.getValue().x) +
                    (player.y + vectY - playerStatsEntry.getValue().y) * (player.y + vectY - playerStatsEntry.getValue().y));
            if (distance <= 23 && !dmged) {
                room.players.get(playerStatsEntry.getKey()).paramEffects.add(new EffectDamage(room.players.get(playerStatsEntry.getKey()), 50));
                dmged = true;
            }
        }

        player.hasControl = false;

        if(--time == 0){
            isActive = false;
            isAlive = false;
            player.hasControl = true;
            room.players.get(playerHash).moveAction.setNewMove();
        }
    }
}
