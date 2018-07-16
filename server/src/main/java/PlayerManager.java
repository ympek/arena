import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.*;

class PlayerManager {

    GameServer gameServer;

    Set<Integer> waitingRoom;
    ArrayList<Room> rooms;
    Map<Integer, Room> playerRoomMap;

    ProtocolEncoder protocolEncoder;
    ProtocolDecoder protocolDecoder;

    PlayerManager(GameServer gameServer){
        this.gameServer = gameServer;

        waitingRoom = new HashSet<>();
        rooms = new ArrayList<>();
        playerRoomMap = new HashMap<>();

        try {
            protocolEncoder = new ProtocolEncoder("arenaProtocol.json");
            protocolDecoder = new ProtocolDecoder("arenaProtocol.json");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    void newConnection(int hash){
        GlobalSettings.print("New connection with hash: " + hash);
        waitingRoom.add(hash);
    }

    void removeConnection(int hash){
        GlobalSettings.print("Remove connection with hash: " + hash);
        if(waitingRoom.contains(hash)) waitingRoom.remove(hash);
        else playerRoomMap.get(hash).removePlayer(hash);
    }

    void handleMessage(int hash, ByteBuffer message){
        MessageData messageData = protocolDecoder.decodeMessage(message);

        if(messageData.getMessageId() == 0){
            if(!handleLoginReq(hash, messageData.getStringParameter("name").getValue())){
                //PlayerManager responses with reject message if all rooms are full
                //in case of success acknowledge is sent by specific room
                MessageData response = new MessageData(1, "loginRej");
                response.addParameter("answerCode", 0);
                response.addParameter("responseString", "All rooms are full!");
                gameServer.sendToPlayer(hash, protocolEncoder.encodeMessage(response));
            }
        }
        else{
            playerRoomMap.get(hash).handleMessage(hash, messageData);
        }
    }

    private boolean handleLoginReq(int hash, String name){
        Room bestRoom = null;
        int minSize = 0;
        PlayerInfo playerInfo;

        if(rooms.size() == 0) rooms.add(new Room(gameServer, protocolEncoder));

        for(Room room : rooms){
            if(room.size < minSize){
                bestRoom = room;
                minSize = room.size;
            }
        }
        //==============================================================================================================
        //Name validation

        playerInfo = new PlayerInfo(hash, name, name.equals("admin"));

        //==============================================================================================================

        if(bestRoom.addPlayer(playerInfo)){
            playerRoomMap.put(hash, bestRoom);
            waitingRoom.remove(hash);
            return true;
        }
        else if(rooms.size() < GlobalSettings.ROOM_MAX_AMOUNT){
            Room newRoom = new Room(gameServer, protocolEncoder);
            rooms.add(newRoom);
            newRoom.addPlayer(playerInfo);
            playerRoomMap.put(hash, newRoom);
            waitingRoom.remove(hash);
            return true;
        }
        else return false;
    }
}
