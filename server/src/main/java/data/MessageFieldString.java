package data;

public class MessageFieldString extends MessageField {

    String value;

    public MessageFieldString(String newName, String newValue){
        super(newName);
        this.value = newValue;
    }

    public String getValue(){
        return this.value;
    }
}
