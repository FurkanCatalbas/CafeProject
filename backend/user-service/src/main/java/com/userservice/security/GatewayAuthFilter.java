package com.userservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class GatewayAuthFilter extends OncePerRequestFilter {

    private final JwtValidationService jwtValidationService;

    public GatewayAuthFilter(JwtValidationService jwtValidationService) {
        this.jwtValidationService = jwtValidationService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String userId = request.getHeader("X-User-Id");
        String userRole = request.getHeader("X-User-Role");

        if (StringUtils.hasText(userId) && StringUtils.hasText(userRole)) {
            setAuthentication(userId.trim(), userRole.trim());
        } else {
            String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
            if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                try {
                    String username = jwtValidationService.extractUsername(token);
                    if (username != null && jwtValidationService.isTokenValid(token, username)) {
                        String role = jwtValidationService.extractRole(token);
                        if (!StringUtils.hasText(role)) {
                            role = "USER";
                        }
                        setAuthentication(username, role);
                    }
                } catch (Exception ignored) {
                    // anonim bırak; Security 403/401 üretir
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private void setAuthentication(String principal, String role) {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase().trim()));

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(principal, null, authorities);

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}