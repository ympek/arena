
public final class GlobalSettings {

    public static boolean traces = true;
    public static final void print(String str){
        if(traces){
            System.out.println(str);
        }
    }
}
