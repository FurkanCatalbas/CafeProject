package com.authservice.controllers;

import com.authservice.models.TokenRequest;
import com.authservice.models.TokenResponse;
import com.authservice.models.UserDto;
import com.authservice.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<TokenResponse> register(@RequestBody UserDto userDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.register(userDto)); // 200 yerine created 201 dönmesi için
    }

    @PostMapping("/token")
    public ResponseEntity<TokenResponse> authenticate(@RequestBody TokenRequest request) {
        return ResponseEntity.ok(userService.getToken(request));
    }

    @PostMapping("/refresh-token")
    public TokenResponse refreshToken(HttpServletRequest request, HttpServletResponse response) throws IOException {
        return userService.refreshToken(request, response);
    }
}