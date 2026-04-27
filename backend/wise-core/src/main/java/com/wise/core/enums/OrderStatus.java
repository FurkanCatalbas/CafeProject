package com.wise.core.enums;

import java.io.Serializable;
import java.util.Arrays;

public enum OrderStatus implements Serializable {
    PENDING("PENDING"),
    ORDER_RECEIVED("ORDER_RECEIVED"),
    PREPARING("PREPARING"),
    READY("READY"),
    SERVED("SERVED"),
    WAITING_PAYMENT("WAITING_PAYMENT"),
    DELIVERED("DELIVERED"),
    CANCELLED("CANCELLED"),
    PAID("PAID");

    private final String value;

    OrderStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static OrderStatus fromValue(String value) {
        return Arrays.stream(values())
                .filter(status -> status.value.equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid order status: " + value));
    }
}
