package com.authservice.services;

import com.authservice.models.TokenRequest;
import com.authservice.models.TokenResponse;
import com.authservice.models.UserDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

public interface UserService {
    TokenResponse register(UserDto userDto);
    TokenResponse getToken(TokenRequest tokenRequest);
    TokenResponse refreshToken(HttpServletRequest request, HttpServletResponse response) throws IOException;
}
