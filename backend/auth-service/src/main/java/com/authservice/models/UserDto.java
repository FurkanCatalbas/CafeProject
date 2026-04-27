package com.authservice.models;

import com.wise.core.enums.UserRole;
import lombok.Data;

@Data
public class UserDto {
    private Integer id;

    private Integer type;

    private String username;

    private String password;

    private String firstName;

    private String lastName;

    private String emailAddress;

    private UserRole roleName;


}
