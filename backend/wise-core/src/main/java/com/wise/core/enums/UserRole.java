package com.wise.core.enums;

import java.io.Serializable;
import java.util.Arrays;

public enum UserRole implements Serializable {
    ADMIN("ADMIN"),
    MANAGER("MANAGER"),
    WAITER("WAITER"),
    CASHIER("CASHIER"),
    CUSTOMER("CUSTOMER");

    private final String value;

    UserRole(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static UserRole fromValue(String value) {
        return Arrays.stream(values())
                .filter(role -> role.value.equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid user role: " + value));
    }
}
