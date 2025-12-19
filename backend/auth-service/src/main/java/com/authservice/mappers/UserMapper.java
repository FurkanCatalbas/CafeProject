package com.authservice.mappers;

import com.authservice.models.UserDto;
import com.authservice.models.UserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper()
public interface UserMapper {
    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    UserDto toDto(UserEntity source);

    UserEntity toEntity(UserDto source);

}
