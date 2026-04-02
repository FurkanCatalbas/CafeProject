package com.authservice.configs;

import io.jsonwebtoken.Claims;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter implements Filter {

    private final JwtService jwtService;
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws IOException, ServletException {


        String path = request.getRequestURI();

        // Whitelist edilen endpointleri burada kontrol et!
        if (path.startsWith("/api/auth")) {
            filterChain.doFilter(request, response); // JWT kontrolü yapmadan devam et
            return;
        }

        try {
            String authorizationHeader = request.getHeader("Authorization");

            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }

            String token = authorizationHeader.substring(7);

            if (!isJwtValid(token)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Invalid");
                return;
            }

            String userName = jwtService.extractUsername(token);
            if (userName != null) {
                Claims claims = jwtService.extractAllClaims(token);
                Map<String, Object> userObject = (Map<String, Object>) claims.get("userObject");

                // Token'ı credential olarak kullanmak yerine null geç
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userObject, null, Collections.emptyList());

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }

            filterChain.doFilter(request, response);

        } catch (Exception ex) {
            log.error("Authentication error", ex);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Authentication");
        }
    }

    private boolean isJwtValid(String jwt) {
        try {
            String username = jwtService.extractUsername(jwt);
            return username != null && !username.isEmpty() && jwtService.isTokenValid(jwt, username);
        } catch (Exception ex) {
            log.error("JWT validation error", ex);
            return false;
        }
    }
}