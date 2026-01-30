package com.authservice.models.enums;

import lombok.Getter;

@Getter
public enum RoleType {
    ADMIN(1),
    MUTFAK_PERSONELI(2),
    MUSTERI(3);

    private final int value;

    RoleType(int value) {
        this.value = value;
    }
}