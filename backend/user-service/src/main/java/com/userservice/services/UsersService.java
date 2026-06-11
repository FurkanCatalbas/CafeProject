package com.userservice.services;

import com.userservice.models.UserDto;
import java.util.List;

public interface UsersService {
    UserDto create(UserDto userDto, String requesterRole, String businessCode);
    UserDto update(UserDto userDto, String requesterRole, String businessCode);
    List<UserDto> getAll(String requesterRole, String businessCode);
    UserDto getById(Integer id);
    void delete(Integer id, String requesterRole, String businessCode);
}
