package com.wise.core.enums;

import java.io.Serializable;
import java.util.Arrays;

public enum PaymentStatus implements Serializable {
    UNPAID("UNPAID"),
    PAID("PAID"),
    REFUNDED("REFUNDED"),
    FAILED("FAILED");

    private final String value;

    PaymentStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static PaymentStatus fromValue(String value) {
        return Arrays.stream(values())
                .filter(status -> status.value.equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid payment status: " + value));
    }
}
