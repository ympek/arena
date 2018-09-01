package logic;

import actions.Action;
import actions.ActionDash;
import actions.ActionMove;
import actions.Effect;
import playerData.PlayerContext;
import playerData.ROPlayerStats;

import java.nio.ByteBuffer;
import java.util.*;

/**
 * Created by Arkadiusz Nowak on 16.07.2018.
 */
public class Room implements Runnable {

    GameServer gameServer;
    ProtocolEncoder protocolEncoder;

    private boolean running;
    private Thread internalThread;

    public Queue<Integer> playersActionHashes;
    public Map<Integer, ROPlayerStats> playersActionStats;

    public Map<Integer, PlayerContext> players;
    int size = 0;
    private Stack<Integer> freeIds;
    private int lastVipId;

    Room(GameServer gameServer, ProtocolEncoder protocolEncoder){
        this.running = false;
        this.playersActionHashes = new LinkedList<>();
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
                MessageData intro = MessageBuilder.buildPlayerIntroInd(id, name, newPlayer.stats.x, newPlayer.stats.y, newPlayer.stats.health);

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
                    if(!player.stats.hasControl) return;
                    player.targetX = messageData.getDoubleParameter("absMouseCoordX").getValue();
                    player.targetY = messageData.getDoubleParameter("absMouseCoordY").getValue();
                    player.actions.add(new ActionMove(hash, this, player.targetX, player.targetY));
                    GlobalSettings.print("Player "+ player.name +" target: X = " + player.targetX + "; target Y = " + player.targetY);
                }
                else if(messageData.getIntegerParameter("inputId").getValue() == 1){
                    if(!player.stats.hasControl) return;
                    if(player.moveAction != null) player.moveAction = null;
                    player.targetX = messageData.getDoubleParameter("absMouseCoordX").getValue();
                    player.targetY = messageData.getDoubleParameter("absMouseCoordY").getValue();
                    player.actions.add(new ActionDash(hash, this, player.targetX, player.targetY));
                    GlobalSettings.print("Player "+ player.name +" target: X = " + player.targetX + "; target Y = " + player.targetY);
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
        long timeMillis = 1000/ GlobalSettings.MAX_FPS;
        long waitTime = 0;
        int frameCount = 0;
        long totalTime = 0;
        long targetTime = 1000/ GlobalSettings.MAX_FPS;
        long gameTime = System.nanoTime();

        while(running) {

            startTime = System.nanoTime();

            //====================================================LOGIC=================================================

            //copy of players state

            playersActionStats = new HashMap<>();
            synchronized(players){
                for(Map.Entry<Integer, PlayerContext> entry : players.entrySet()){
                    playersActionStats.put(entry.getKey(), entry.getValue().stats);
                    playersActionHashes.add(entry.getKey());
                }
            }

            // execute all actions according to queue of players having anything to do
            while (!playersActionHashes.isEmpty()) {
                for (Action action : players.get(playersActionHashes.poll()).actions) {
                    if(action.isActive)
                        action.execute();
                }
            }

            // execute move for each player
            for(Map.Entry<Integer, PlayerContext> entry : players.entrySet()){
                if(entry.getValue().moveAction != null){
                    entry.getValue().moveAction.execute();
                }
            }

            synchronized (players){
                for(Map.Entry<Integer, PlayerContext> entry : players.entrySet()){
                    //remove dead actions
                    entry.getValue().actions.removeIf(action -> !action.isAlive);
                    if (entry.getValue().moveAction != null) {
                        if(!entry.getValue().moveAction.isAlive)
                          entry.getValue().moveAction = null;
                    }
                    //execute status effects for each player and clear effect list
                    Iterator<Effect> sEffectIterator = entry.getValue().statusEffects.iterator();
                    while(sEffectIterator.hasNext()){
                        Effect sEffect = sEffectIterator.next();
                        sEffect.execute();
                        if(sEffect.time == 0) sEffectIterator.remove();
                    }

                    //execute parameters changing effects for each player and clear effect list
                    Iterator<Effect> pEffectIterator = entry.getValue().paramEffects.iterator();
                    while(pEffectIterator.hasNext()){
                        Effect pEffect = pEffectIterator.next();
                        pEffect.execute();
                        if(pEffect.time == 0) pEffectIterator.remove();
                    }

                    //==================================================================================================
                    //check if dead
                    //make parameters and movement validation
                    //==================================================================================================
                    ByteBuffer messageBuf = protocolEncoder.encodeMessage(MessageBuilder.buildMoveUpdateInd(
                            entry.getValue().id, entry.getValue().stats.x, entry.getValue().stats.y,
                            entry.getValue().targetX, entry.getValue().targetY, entry.getValue().stats.speed));

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
