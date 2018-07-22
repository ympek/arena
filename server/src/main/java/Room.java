import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Stack;

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
    private Stack<Integer> freeIds;
    private int lastVipId;

    Room(GameServer gameServer, ProtocolEncoder protocolEncoder){
        this.running = false;
        this.players = new HashMap<>();
        this.gameServer = gameServer;
        this.protocolEncoder = protocolEncoder;

        this.freeIds = new Stack<>();
        for(int i = 9; i >= 0; --i){
            freeIds.push(i);
        }
        this.lastVipId = 50;
    }

    boolean addPlayer(PlayerInfo playerInfo){
        int hash = playerInfo.hash;

        if(players.size() >= 10 && !playerInfo.vip){
            return false;
        }
        else{
            synchronized (players){

                String name;
                int id;

                if(playerInfo.vip){
                    name = "pedau";
                    id = lastVipId++;
                }
                else{
                    name = playerInfo.name;
                    id = freeIds.pop();
                }

                players.put(hash, new PlayerContext(id, name, playerInfo.vip));
                this.size = players.size();

                PlayerContext newPlayer = players.get(hash);

                MessageData response = MessageBuilder.buildLoginAck(id, name);
                MessageData intro = MessageBuilder.buildPlayerIntroInd(id, name, newPlayer.positionX, newPlayer.positionY, newPlayer.health);

                gameServer.sendToPlayer(hash, protocolEncoder.encodeMessage(response));
                gameServer.sendToPlayer(hash, protocolEncoder.encodeMessage(intro));

                if(this.running == false) {
                    this.running = true;
                    internalThread = new Thread(this);
                    internalThread.start();
                }
                GlobalSettings.print("New player: " + newPlayer.name);
                return true;
            }
        }
    }

    void removePlayer(int hash){
        synchronized (players){

            if(!players.get(hash).vip){
                freeIds.push(players.get(hash).id);
            }

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
            synchronized (player) {
                if (messageData.getIntegerParameter("inputId").getValue() == 3){
                    player.handleMoveTest(messageData.getDoubleParameter("absMouseCoordX").getValue(),
                            messageData.getDoubleParameter("absMouseCoordY").getValue());
                }
            }
        }
        else{
            GlobalSettings.print("WTF, unknown message!");
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

                    ByteBuffer messageBuf = protocolEncoder.encodeMessage(MessageBuilder.buildMoveUpdateInd(
                            entry.getValue().id, entry.getValue().positionX, entry.getValue().positionY,
                            entry.getValue().targetX, entry.getValue().targetY, entry.getValue().speed));

                    for(Map.Entry<Integer, PlayerContext> other : players.entrySet()){
                        gameServer.sendToPlayer(other.getKey(), messageBuf);
                    }
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
