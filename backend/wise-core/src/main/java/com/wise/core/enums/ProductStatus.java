package com.wise.core.enums;

import java.io.Serializable;
import java.util.Arrays;

public enum ProductStatus implements Serializable {
    ACTIVE("ACTIVE"),
    INACTIVE("INACTIVE"),
    OUT_OF_STOCK("OUT_OF_STOCK");

    private final String value;

    ProductStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static ProductStatus fromValue(String value) {
        return Arrays.stream(values())
                .filter(status -> status.value.equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid product status: " + value));
    }
}
