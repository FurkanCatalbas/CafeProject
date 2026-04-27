package com.wise.core.enums;

import java.io.Serializable;
import java.util.Arrays;

public enum PlaceType implements Serializable {
    TABLE("TABLE"),
    TAKEAWAY("TAKEAWAY"),
    DELIVERY("DELIVERY");

    private final String value;

    PlaceType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static PlaceType fromValue(String value) {
        return Arrays.stream(values())
                .filter(type -> type.value.equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid place type: " + value));
    }
}
