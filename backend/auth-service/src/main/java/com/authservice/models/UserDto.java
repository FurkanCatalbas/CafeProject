package com.authservice.models;

import com.wise.core.enums.UserRole;
import com.wise.core.enums.UserStatus;
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

    private UserStatus status;

    private String businessCode;

    private String businessName;


}
