package data;

public class MessageFieldInteger extends MessageField {

    Integer value;

    public MessageFieldInteger(String newName, Integer newValue){
        super(newName);
        this.value = newValue;
    }

    public Integer getValue(){
        return this.value;
    }
}
