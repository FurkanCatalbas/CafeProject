package com.userservice.services;

import com.userservice.models.UserDto;

public interface UsersService {
    UserDto create(UserDto userDto);
    UserDto update(UserDto userDto);
    UserDto getById(Integer id);
}
