package com.userservice.models;


import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Map;

public class CommonAuthenticationUtils {

    private static final ObjectMapper objectMapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    private CommonAuthenticationUtils() {
    }

    /**
     * SecurityContext'ten UserObjectDto nesnesini alır.
     */
    private static UserObjectDto getUserObjectFromContext() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Map<String, Object> userObjectMap = (Map<String, Object>) authentication.getPrincipal();
            return objectMapper.convertValue(userObjectMap, UserObjectDto.class);
        } catch (Exception ex) {
            return null;
        }
    }

    /**
     * Kimlik doğrulama yapılan kullanıcının ID'sini döndürür.
     */
    public static Integer getAuthenticatedUserId() {
        UserObjectDto userObjectDto = getUserObjectFromContext();
        return userObjectDto != null ? userObjectDto.getUserId() : 0;
    }

    /**
     * Kimlik doğrulama yapılan kullanıcının bilgilerini AuthenticateUserDto formatında döndürür.
     */
    public static AuthenticateUserDto getAuthenticatedInfo() {
        UserObjectDto userObjectDto = getUserObjectFromContext();
        if (userObjectDto != null) {
            AuthenticateUserDto authenticateUserDto = new AuthenticateUserDto();
            authenticateUserDto.setUserObjectDto(userObjectDto);
            return authenticateUserDto;
        }
        return null;
    }

    /**
     * Login olmuş kullanıcının token bilgisini döner
     */
    public static String getAuthenticatedToken() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
       /* if (authentication instanceof JwtAuthenticationToken) {
            return ((JwtAuthenticationToken) authentication).getToken();

        }*/

        return null;

    }
}