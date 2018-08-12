package logic;

import java.util.HashMap;
import java.util.Map;

class MessageData {

private     int messageId;
private     String messageName;
private     Map<String, data.MessageField> parameters;

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

    int getMessageId() {
        return messageId;
    }

    String getMessageName() {
        return messageName;
    }

    data.MessageField getParameter(String key){
        return parameters.get(key);
    }

    data.MessageFieldInteger getIntegerParameter(String key){
        return (data.MessageFieldInteger)parameters.get(key);
    }

    data.MessageFieldString getStringParameter(String key){
        return (data.MessageFieldString)parameters.get(key);
    }

    data.MessageFieldDouble getDoubleParameter(String key){
        return (data.MessageFieldDouble)parameters.get(key);
    }

}
