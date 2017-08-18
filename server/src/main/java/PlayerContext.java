
public class PlayerContext {

    String name;
    double prevMouseX;
    double prevMouseY;

    PlayerContext(String name){

        this.name = name;
        this.prevMouseX = 0;
        this.prevMouseY = 0;
    }

    void handleMove(int keyId, double x, double y){

        if(GlobalSettings.traces){
            System.out.println("PlayerContext::diff x: " + (prevMouseX - x) + "diff y: " + (prevMouseY - y));
        }
        this.prevMouseX = x;
        this.prevMouseY = y;
    }

}
