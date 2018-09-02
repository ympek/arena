package actions;

import playerData.PlayerContext;

public class EffectDamage extends Effect {

    int damage;
    EffectDamage(PlayerContext playerContext, int damage){
        super(playerContext);
        power = 5;
        id = 1;
        time = 1;

        this.damage = damage;
    }

    @Override
    public void execute() {

        if(time <= 0) return;

        playerContext.stats.health -= damage;

        --time;
    }
}
