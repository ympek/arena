import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.nio.ByteBuffer;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;

public class ProtocolDecoder {

    int messageIdSize;
    JSONArray clientToServerMessageTypes;

    public ProtocolDecoder(String protocolFile) throws java.io.IOException{
        File protocol = new File(protocolFile);
        JSONObject protocolStandard = new JSONObject(new String(Files.readAllBytes(Paths.get(protocol.getPath()))));
        this.messageIdSize = protocolStandard.getInt("messageIdSize")/8;    //important! size is given in bits and we need bytes
        clientToServerMessageTypes = protocolStandard.getJSONObject("clientToServerMessage").getJSONArray("messageTypes");
    }

    public MessageData decodeMessage(ByteBuffer bufferData){

        //beware of very ugly code

        byte [] tempByteData = bufferData.array();
        Byte [] byteData = new Byte[tempByteData.length];
        for(int i = 0; i<tempByteData.length; i++){
            byteData[i] = tempByteData[i];
        }
//======================================================================================================================

        Byte [] byteMessageId = Arrays.copyOfRange(byteData, 0, messageIdSize);
        int messageId = 0;
        for(int i = 0; i<messageIdSize; i++){
            messageId |= byteMessageId[i]<<((messageIdSize - i -1)*8);
        }

        JSONObject messageType = clientToServerMessageTypes.getJSONObject(messageId);

        MessageData newMessageData = new MessageData(messageId, messageType.getString("messageName"));

        JSONArray parameters = messageType.getJSONArray("messageParameters");

        int byteDataIterator = messageIdSize;

        for(int i = 0; i < parameters.length(); i++){
            if(parameters.getJSONObject(i).getString("type").equals("int")){

                //======================================================================================================

                int parameterSize = parameters.getJSONObject(i).getInt("size")/8;    //important! size is given in bits and we need bytes
                int newOffset = byteDataIterator + parameterSize;

                Byte [] byteMessageParameter = Arrays.copyOfRange(byteData, byteDataIterator, newOffset);
                byteDataIterator = newOffset;

                //======================================================================================================


                int newValue = 0;

                for(int j = 0; j<parameterSize; j++){
                    newValue |= byteMessageParameter[j]<<((parameterSize - j -1)*8);
                }

                newMessageData.addParameter(parameters.getJSONObject(i).getString("name"), newValue);
            }
            else if(parameters.getJSONObject(i).getString("type").equals("string")){

                //======================================================================================================

                int parameterSize = parameters.getJSONObject(i).getInt("size")/8;    //important! size is given in bits and we need bytes
                int newOffset = byteDataIterator + parameterSize;

                Byte [] byteMessageParameter = Arrays.copyOfRange(byteData, byteDataIterator, newOffset);
                byteDataIterator = newOffset;

                //======================================================================================================

                byte [] tempByteArray = new byte[byteMessageParameter.length];

                for(int j = 0; j<byteMessageParameter.length; j++){
                    tempByteArray[j] = byteMessageParameter[j];
                }

                newMessageData.addParameter(parameters.getJSONObject(i).getString("name"), new String(tempByteArray));
            }
            else if(parameters.getJSONObject(i).getString("type").equals("double")){

                //======================================================================================================

                int parameterSize = parameters.getJSONObject(i).getInt("size")/8;    //important! size is given in bits and we need bytes
                int newOffset = byteDataIterator + parameterSize;

                Byte [] byteMessageParameter = Arrays.copyOfRange(byteData, byteDataIterator, newOffset);
                byteDataIterator = newOffset;

                //======================================================================================================

                byte [] tempByteArray = new byte[byteMessageParameter.length];

                for(int j = 0; j<byteMessageParameter.length; j++){
                    tempByteArray[j] = byteMessageParameter[j];
                }

                newMessageData.addParameter(parameters.getJSONObject(i).getString("name"), ByteBuffer.wrap(tempByteArray).getDouble());
            }
        }

        return newMessageData;
    }
}
