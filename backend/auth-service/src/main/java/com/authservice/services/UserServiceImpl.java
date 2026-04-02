package com.authservice.services;

import com.authservice.configs.JwtService;
import com.authservice.mappers.UserMapper;
import com.authservice.models.TokenRequest;
import com.authservice.models.TokenResponse;
import com.authservice.models.UserDto;
import com.authservice.models.UserEntity;
import com.authservice.repositorys.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public UserServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Override
    public TokenResponse register(UserDto userDto) {

        userDto.setPassword(passwordEncoder.encode(userDto.getPassword()));

        UserEntity userEntity = toEntity(userDto);
        userEntity.setEmailAddress(userDto.getEmailAddress());
        userEntity = userRepository.save(userEntity);
        var jwtToken = jwtService.generateToken(toDto(userEntity));
        var refreshToken = jwtService.generateRefreshToken(toDto(userEntity));



        return TokenResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .build();
    }
    @Override
    public TokenResponse getToken(TokenRequest tokenRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        tokenRequest.getUsername(),
                        tokenRequest.getPassword()
                )
        );
        UserEntity userEntity = userRepository.findByUsername(tokenRequest.getUsername())
                .orElseThrow();

        UserDto userDto=toDto(userEntity);

        var jwtToken = jwtService.generateToken(userDto);
        var refreshToken = jwtService.generateRefreshToken(userDto);

        return TokenResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .build();
    }


    @Override
    public void refreshToken(HttpServletRequest request, HttpServletResponse response) throws IOException {

        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        final String refreshToken;
        final String userName;
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return;
        }
        refreshToken = authHeader.substring(7);
        userName = jwtService.extractUsername(refreshToken);
        if (userName != null) {
            UserEntity userEntity = userRepository.findByUsername(userName)
                    .orElseThrow();

            if (jwtService.isTokenValid(refreshToken, userName)) {
                var accessToken = jwtService.generateToken(toDto(userEntity));

                var authResponse = TokenResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(refreshToken)
                        .build();
                new ObjectMapper().writeValue(response.getOutputStream(), authResponse);
            }
        }
    }

    private UserDto toDto(UserEntity entity) {
        return UserMapper.INSTANCE.toDto(entity);
    }

    private UserEntity toEntity(UserDto dto) {
        return UserMapper.INSTANCE.toEntity(dto);
    }

    private List<UserDto> toDtos(List<UserEntity> entities) {

        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
