package data;

abstract public class MessageField {

    String fieldName;

    MessageField(String newName){
        this.fieldName = newName;
    }

    public String getName(){
        return this.fieldName;
    }

}
