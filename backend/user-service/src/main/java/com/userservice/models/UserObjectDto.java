package com.userservice.models;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UserObjectDto {

    private Integer userId;
    private String username;
    private Integer userType;
    private List<String> roles;
}
