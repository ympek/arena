
public class PlayerContext {

    String name;
    boolean ready;
    double positionX;
    double positionY;
    double prevMouseX;
    double prevMouseY;

    PlayerContext(String name, double x, double y){

        this.ready = false;
        this.name = name;
        this.positionX = x;
        this.positionY = y;
        this.prevMouseX = 0;
        this.prevMouseY = 0;
    }

    void handleMove(int keyId, double x, double y) {
        if(!this.ready)
            return;

        if (GlobalSettings.traces) {
            System.out.println("PlayerContext::diff x: " + (prevMouseX - x) + "diff y: " + (prevMouseY - y));
        }
        this.prevMouseX = x;
        this.prevMouseY = y;
    }

    public boolean setName(String name) {
        GlobalSettings.print("Player name set to: " + name);
        boolean result = this.name.trim().equals("");
        this.name = name;
        this.ready = true;
        return result;
    }
}
