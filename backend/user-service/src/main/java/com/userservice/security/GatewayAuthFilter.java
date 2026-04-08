// user-service/src/main/java/com/project/userservice/security/GatewayAuthFilter.java
package com.userservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class GatewayAuthFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Gateway'den gelen header'ları oku
        String userId = request.getHeader("X-User-Id");
        String userRole = request.getHeader("X-User-Role");

        // Eğer Gateway bu isteği doğruladıysa (header'lar varsa)
        if (userId != null && userRole != null) {

            // Rolü Spring Security formatına çevir (ROLE_ prefix'i şart)
            List<SimpleGrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority("ROLE_" + userRole.toUpperCase().trim()));

            // Authentication token oluştur
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userId,           // principal (kullanıcı adı)
                            null,             // credentials (şifre yok, Gateway halletti)
                            authorities       // yetkiler
                    );

            // SecurityContext'e yerleştir
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // Zinciri devam ettir
        filterChain.doFilter(request, response);
    }
}