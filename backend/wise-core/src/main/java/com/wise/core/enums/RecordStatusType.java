package com.wise.core.enums;

public enum RecordStatusType {
    NONE("NONE"),
    CREATE("CREATE"),
    UPDATE("UPDATE"),
    DELETE("DELETE");

    private final String value;
    RecordStatusType(String value) { this.value = value; }
    public String getValue() { return value; }
}