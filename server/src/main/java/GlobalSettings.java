
public final class GlobalSettings {

    public static boolean traces = true;
    public static int MAP_SIZE_X = 1200;
    public static int MAP_SIZE_Y = 600;
    public static int PLAYER_SIZE_X = 64;
    public static int PLAYER_SIZE_Y = 128;
    public static final void print(String str){
        if(traces){
            System.out.println(str);
        }
    }
}
