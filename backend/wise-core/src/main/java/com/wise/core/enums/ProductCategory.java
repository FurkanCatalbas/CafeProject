package com.wise.core.enums;

import java.io.Serializable;
import java.util.Arrays;

public enum ProductCategory implements Serializable {
    SOGUK_ICECEK("soğuk içecek"),
    SICAK_ICECEK("sıcak içecek"),
    CORBA("çorba"),
    TATLI("tatlı");

    private final String value;

    ProductCategory(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static ProductCategory fromValue(String value) {
        return Arrays.stream(values())
                .filter(cat -> cat.value.equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid product category: " + value));
    }
}
