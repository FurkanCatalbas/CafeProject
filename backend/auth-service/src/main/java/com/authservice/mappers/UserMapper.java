package com.authservice.mappers;

import com.authservice.models.UserDto;
import com.authservice.models.UserEntity;

/**
 * Manual DTO mapping (MapStruct was not generating implementations without APT config;
 * avoids runtime Mappers.getMapper failures).
 */
public final class UserMapper {

    private UserMapper() {}

    public static UserDto toDto(UserEntity source) {
        if (source == null) {
            return null;
        }
        UserDto dto = new UserDto();
        dto.setId(source.getId());
        dto.setType(source.getType());
        dto.setUsername(source.getUsername());
        dto.setPassword(source.getPassword());
        dto.setFirstName(source.getFirstName());
        dto.setLastName(source.getLastName());
        dto.setEmailAddress(source.getEmailAddress());
        dto.setRoleName(source.getRoleName());
        return dto;
    }

    public static UserEntity toEntity(UserDto source) {
        if (source == null) {
            return null;
        }
        UserEntity entity = new UserEntity();
        entity.setId(source.getId());
        entity.setType(source.getType());
        entity.setUsername(source.getUsername());
        entity.setPassword(source.getPassword());
        entity.setFirstName(source.getFirstName());
        entity.setLastName(source.getLastName());
        entity.setEmailAddress(source.getEmailAddress());
        entity.setRoleName(source.getRoleName());
        return entity;
    }
}
