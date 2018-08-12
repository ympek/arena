package logic;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.nio.ByteBuffer;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;

public class ProtocolEncoder {

    int messageIdSize;
    JSONArray serverToClientMessageTypes;

    public ProtocolEncoder(String protocolFile)throws java.io.IOException{

        File protocol = new File(protocolFile);
        JSONObject protocolStandard = new JSONObject(new String(Files.readAllBytes(Paths.get(protocol.getPath()))));
        this.messageIdSize = protocolStandard.getInt("messageIdSize")/8;    //important! size is given in bits and we need bytes
        serverToClientMessageTypes = protocolStandard.getJSONObject("serverToClientMessage").getJSONArray("messageTypes");
    }

    public ByteBuffer encodeMessage (MessageData messageData) {

        //encode messageId
        ArrayList<Byte> bytes = new ArrayList<>();

//        byte[] messageId = ByteBuffer.allocate(messageIdSize).putInt(messageData.getMessageId()).array();
        byte[] messageId = intToByteArray(messageData.getMessageId(),messageIdSize);

        for (byte b : messageId) {
            bytes.add(b);
        }

        //encode parameters

        JSONObject messageType = serverToClientMessageTypes.getJSONObject(messageData.getMessageId());
        JSONArray parameters = messageType.getJSONArray("messageParameters");

        for (int i = 0; i < parameters.length(); i++) {

            JSONObject param = parameters.getJSONObject(i);

            if (param.getString("type").equals("int")) {
                int tempInt = messageData.getIntegerParameter(param.getString("name")).getValue();
//                byte[] intBytes = ByteBuffer.allocate(param.getInt("size")/8).putInt(tempInt).array();
                byte[] intBytes = intToByteArray(tempInt,param.getInt("size")/8);
                for (byte b : intBytes) {
                    bytes.add(b);
                }
            }
            else if(param.getString("type").equals("string")){
                String tempString = messageData.getStringParameter(param.getString("name")).getValue();
                byte[] stringBytes = tempString.getBytes();
                for (byte b : stringBytes) {
                    bytes.add(b);
                }
            }
            else if(param.getString("type").equals("double")){
                Double tempDouble = messageData.getDoubleParameter(param.getString("name")).getValue();
                byte[] doubleBytes = new byte[8];
                ByteBuffer.wrap(doubleBytes).putDouble(tempDouble);
                for (byte b : doubleBytes) {
                    bytes.add(b);
                }
            }
        }
        ByteBuffer buffer = ByteBuffer.allocate(bytes.size());
        for(Byte b : bytes) {
            buffer.put(b);
        }
        return buffer;
    }

    public static final byte[] intToByteArray(int value, int size) {
        byte[] result = new byte[size];
        for (int i = 0; i < size; i++) {
            result[i] = (byte)(value >>> (size - i - 1)*8);
        }
        return result;
    }
}
