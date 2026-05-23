package com.project.gatewayservice.security;

import com.wise.core.enums.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private JwtService jwtService;
    @Autowired
    private RouteValidator validator;

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public AuthenticationFilter() {
        super(Config.class);
    }
    public static class Config {}

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            
            // 1. Token var mı kontrol et (Her zaman kontrol ediyoruz)
            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            String token = (authHeader != null && authHeader.startsWith("Bearer ")) ? authHeader.substring(7) : null;
            
            String userId = "0";
            String role = UserRole.CUSTOMER.getValue();

            // 2. Token varsa bilgileri her durumda çıkar
            if (token != null) {
                try {
                    userId = jwtService.extractUserId(token);
                    role = normalizeRole(jwtService.extractRole(token));
                    
                    // Sadece korumalı rotalarda token validasyonu yap
                    if (validator.isSecured.test(request)) {
                        if (!jwtService.isTokenValid(token, jwtService.extractUsername(token))) {
                            return onError(exchange, "ERR-003: Token gecersiz", HttpStatus.FORBIDDEN);
                        }
                    }
                } catch (Exception e) {
                    if (validator.isSecured.test(request)) {
                        return onError(exchange, "ERR-004: Token dogrulama hatasi", HttpStatus.FORBIDDEN);
                    }
                }
            } else if (validator.isSecured.test(request)) {
                // Token yok ama rota korumalı ise hata ver
                return onError(exchange, "ERR-001: Token eksik", HttpStatus.UNAUTHORIZED);
            }

            // 3. Header'ları zenginleştirerek isteği ilet
            // Bu sayede hem Admin (POST yaparken) hem Müşteri (GET yaparken) tanınacak
            ServerHttpRequest mutatedRequest = request.mutate()
                    .header("X-User-Id", userId)
                    .header("X-User-Role", role)
                    .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        exchange.getResponse().setStatusCode(httpStatus);
        exchange.getResponse().getHeaders().setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
        String body = "{\"error\": \"" + err + "\"}";
        return exchange.getResponse().writeWith(Mono.just(exchange.getResponse().bufferFactory().wrap(body.getBytes())));
    }

    private String normalizeRole(String role) {
        UserRole userRole = resolveRole(role);
        return userRole == null ? null : userRole.getValue();
    }

    private UserRole resolveRole(String role) {
        if (role == null || role.isBlank()) {
            return null;
        }
        try {
            return UserRole.fromValue(role.trim());
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }
}
