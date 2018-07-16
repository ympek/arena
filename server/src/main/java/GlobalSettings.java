
public final class GlobalSettings {

    public static final boolean traces = true;
    public static final int ROOM_SIZE = 10;
    public static final int ROOM_MAX_AMOUNT = 1;
    public static final int MAX_FPS = 30;


    public static final int MAP_SIZE_X = 1960;
    public static final int MAP_SIZE_Y = 600;
    public static final int PLAYER_SIZE_X = 64;
    public static final int PLAYER_SIZE_Y = 128;
    public static final void print(String str){
        if(traces){
            System.out.println(str);
        }
    }
}
