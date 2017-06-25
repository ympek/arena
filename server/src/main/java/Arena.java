import org.java_websocket.WebSocketImpl;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class Arena {

    public static void main(String [] args) throws InterruptedException , IOException {

        //chodzi o to, żeby serwer był tylko klasą wykorzystywaną przez klasę główną
        //spróbuj to jakoś posprzątać, żeby było ładnie

        WebSocketImpl.DEBUG = true;
        int port = 8020; // 843 flash policy port
        try {
            port = Integer.parseInt( args[ 0 ] );
        } catch ( Exception ex ) {
        }
        GameServer s = new GameServer( port );
        s.start();
        System.out.println( "GameServer started on port: " + s.getPort() );

        BufferedReader sysin = new BufferedReader( new InputStreamReader( System.in ) );
        while ( true ) {
            String in = sysin.readLine();
            s.sendToAll( in );
            if( in.equals( "exit" ) ) {
                s.stop();
                break;
            }
        }
    }

}