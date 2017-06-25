import java.util.HashMap;
import java.util.Map;

public class MessageData {

    int messageId;
    String messageName;
    Map<String, data.MessageField> parameters;

    MessageData(int messageId, String messageName){
        this.messageId = messageId;
        this.messageName = messageName;
        this.parameters = new HashMap<>();
    }

    void addParameter(String fieldName, Integer fieldVal){
        data.MessageFieldInteger newParameter = new data.MessageFieldInteger(fieldName, fieldVal);
        parameters.put(newParameter.getName(), newParameter);
    }

    void addParameter(String fieldName, String fieldVal){
        data.MessageFieldString newParameter = new data.MessageFieldString(fieldName, fieldVal);
        parameters.put(newParameter.getName(), newParameter);
    }

    void addParameter(String fieldName, Double fieldVal){
        data.MessageFieldDouble newParameter = new data.MessageFieldDouble(fieldName, fieldVal);
        parameters.put(newParameter.getName(), newParameter);
    }

}
