package data;

public class MessageFieldDouble extends MessageField {

    Double value;

    public MessageFieldDouble(String newName, Double newValue){
        super(newName);
        this.value = newValue;
    }

    public Double getValue(){
        return this.value;
    }
}
