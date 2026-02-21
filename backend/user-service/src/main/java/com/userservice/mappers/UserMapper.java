package com.userservice.mappers;


import com.userservice.models.UserDto;
import com.userservice.models.UserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper()
public interface UserMapper {
    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    UserDto toDto(UserEntity source);

    UserEntity toEntity(UserDto source);

}
