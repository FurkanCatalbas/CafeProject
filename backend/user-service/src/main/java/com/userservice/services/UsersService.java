package com.userservice.services;

import com.userservice.models.UserDto;
import java.util.List;

public interface UsersService {
    UserDto create(UserDto userDto);
    UserDto update(UserDto userDto);
    List<UserDto> getAll();
    UserDto getById(Integer id);
    void delete(Integer id);
}
