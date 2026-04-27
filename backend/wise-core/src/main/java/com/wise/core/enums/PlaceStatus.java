package com.wise.core.enums;

import java.io.Serializable;
import java.util.Arrays;

public enum PlaceStatus implements Serializable {
    AVAILABLE("AVAILABLE"),
    OCCUPIED("OCCUPIED"),
    RESERVED("RESERVED"),
    CLOSED("CLOSED");

    private final String value;

    PlaceStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static PlaceStatus fromValue(String value) {
        return Arrays.stream(values())
                .filter(status -> status.value.equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid place status: " + value));
    }
}
