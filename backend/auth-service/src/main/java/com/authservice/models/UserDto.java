package com.authservice.models;

import com.authservice.models.enums.RoleType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class UserDto {

    @Schema(accessMode = Schema.AccessMode.READ_ONLY) // openapideki id kısmnın istenemsini engeller
    private Integer id;

    private Integer type;

    private String username;

    private String password;

    private String firstName;

    private String lastName;

    private String emailAddress;

    private RoleType role;


}
