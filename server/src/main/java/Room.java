import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by Arkadiusz Nowak on 16.07.2018.
 */
public class Room implements Runnable {

    GameServer gameServer;
    ProtocolEncoder protocolEncoder;

    private boolean running;
    private Thread internalThread;


    private Map<Integer, PlayerContext> players;
    int size = 0;

    Room(GameServer gameServer, ProtocolEncoder protocolEncoder){
        this.running = false;
        this.players = new HashMap<>();
        this.gameServer = gameServer;
        this.protocolEncoder = protocolEncoder;
    }

    boolean addPlayer(PlayerInfo playerInfo){
        int hash = playerInfo.hash;

        if(players.size() >= 10 && !playerInfo.vip){
            return false;
        }
        else{
            synchronized (players){

                players.put(hash, new PlayerContext(playerInfo.name));
                this.size = players.size();

                MessageData response = new MessageData(0, "loginAck");
                response.addParameter("answerCode", 0);
                response.addParameter("spawnX", (int)players.get(hash).positionX);
                response.addParameter("spawnY", (int)players.get(hash).positionY);
                gameServer.sendToPlayer(hash, protocolEncoder.encodeMessage(response));

                if(this.running == false) {
                    this.running = true;
                    internalThread = new Thread(this);
                    internalThread.start();
                }
                GlobalSettings.print("New player: " + players.get(hash).name);
                return true;
            }
        }
    }

    void removePlayer(int hash){
        synchronized (players){

            players.remove(hash);
            this.size = players.size();

            if(this.size == 0){
                this.running = false;
            }
        }
    }

    void handleMessage(int hash, MessageData messageData){
        if(messageData.getMessageId() == 1) { //actionInd
            PlayerContext player = players.get(hash);
            synchronized (player){
                player.handleMoveTest(  messageData.getDoubleParameter("absMouseCoordX").getValue(),
                                        messageData.getDoubleParameter("absMouseCoordY").getValue());
            }
        }
    }

    @Override
    public void run() {

        long startTime;
        long timeMillis = 1000/GlobalSettings.MAX_FPS;
        long waitTime = 0;
        int frameCount = 0;
        long totalTime = 0;
        long targetTime = 1000/GlobalSettings.MAX_FPS;
        long gameTime = System.nanoTime();

        while(running) {

            startTime = System.nanoTime();

            //====================================================LOGIC=================================================

            //copy of players state

            Map<Integer, PlayerContext> playersMap = new HashMap<>();
            synchronized(players){
                for(Map.Entry<Integer, PlayerContext> entry : players.entrySet()){
                    playersMap.put(entry.getKey(), new PlayerContext(entry.getValue()));
                }
            }

            // stuff

                //TODO

            // update

            synchronized (players){
                for(Map.Entry<Integer, PlayerContext> entry : players.entrySet()){
                    entry.getValue().move();
                    entry.getValue().update(frameCount);
                }
            }


            //==========================================================================================================

            timeMillis = (System.nanoTime() - startTime)/(1000*1000);
            waitTime = targetTime - timeMillis;
            try{
                if(waitTime > 0) {
                    internalThread.sleep(waitTime);
                }

            }catch(Exception e){
                e.printStackTrace();
            }

            totalTime += System.nanoTime() - startTime;
            frameCount++;
            if(frameCount == GlobalSettings.MAX_FPS){
                long averageFPS = 1000/((totalTime/frameCount)/(1000*1000));
                frameCount = 0;
                totalTime = 0;
                System.out.println(averageFPS);
            }
        }
    }
}
