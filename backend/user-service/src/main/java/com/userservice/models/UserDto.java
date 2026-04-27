package com.userservice.models;

import com.wise.core.enums.UserRole;
import com.wise.core.enums.UserStatus;
import lombok.Getter;
import lombok.Setter;
import com.wise.core.models.BaseDto; // wise-core'dan gelecek

@Getter
@Setter
public class UserDto extends BaseDto{
    private UserStatus status;

    private Integer type;

    private String username;

    private String password;

    private String firstName;

    private String lastName;

    private String emailAddress;

    private UserRole roleName;

}
