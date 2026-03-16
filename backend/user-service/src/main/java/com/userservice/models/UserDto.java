package com.userservice.models;

import lombok.Getter;
import lombok.Setter;
import com.wise.core.models.BaseDto; // wise-core'dan gelecek

@Getter
@Setter
public class UserDto extends BaseDto{
    private Integer status;

    private Integer type;

    private String username;

    private String password;

    private String firstName;

    private String lastName;

    private String emailAddress;

    private String roleName;

}
