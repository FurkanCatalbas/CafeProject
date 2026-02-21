package com.userservice.enums;



import java.io.Serializable;
import java.util.Arrays;


public enum OutcomeType implements Serializable {
    success("success"),
    error("error"),
    warning("warning"),
    redirect("redirect");

    private final String value;

    OutcomeType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static OutcomeType fromValue(String value) {
        return Arrays.stream(values())
                .filter(type -> type.value.equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid MessageType: " + value));
    }
}
