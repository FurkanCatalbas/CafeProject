package com.wise.core.enums;

import java.io.Serializable;
import java.util.Arrays;

public enum PaymentMethod implements Serializable {
    CASH("CASH"),
    CARD("CARD"),
    ONLINE("ONLINE");

    private final String value;

    PaymentMethod(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static PaymentMethod fromValue(String value) {
        return Arrays.stream(values())
                .filter(method -> method.value.equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid payment method: " + value));
    }
}
