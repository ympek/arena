package actions;

import playerData.PlayerContext;

/**
 * Created by Arkadiusz Nowak on 11.08.2018.
 */
public class EffectMove extends Effect {

    double vectX;
    double vectY;

    EffectMove(PlayerContext playerContext, double vectX, double vectY){
        super(playerContext);
        power = 5;
        id = 0;
        time = 1;

        this.vectX = vectX;
        this.vectY = vectY;
    }

    @Override
    public void execute() {

        if(time <= 0) return;

        playerContext.prevPosX = playerContext.stats.x;
        playerContext.prevPosY = playerContext.stats.y;
        playerContext.stats.x += vectX;
        playerContext.stats.y += vectY;

        --time;
    }
}
