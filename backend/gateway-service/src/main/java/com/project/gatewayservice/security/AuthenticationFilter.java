package com.project.gatewayservice.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private JwtService jwtService;
    @Autowired
    private RouteValidator validator;

    public AuthenticationFilter() {
        super(Config.class);
    }

    public static class Config {}

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            if (validator.isSecured.test(request)) {
                // ERR-001: Authorization header eksik
                if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                    return onError(exchange, "ERR-001: Yetkilendirme basligi eksik", HttpStatus.UNAUTHORIZED);
                }

                String authHeader = request.getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
                // ERR-002: Token formatı yanlış
                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                    return onError(exchange, "ERR-002: Gecersiz yetkilendirme basligi formati", HttpStatus.BAD_REQUEST);
                }

                String token = authHeader.substring("Bearer ".length());

                String username = jwtService.extractUsername(token);

                if (username == null || !jwtService.isTokenValid(token, username)) {
                    return onError(exchange, "ERR-003: Gecersiz veya suresi dolmus token", HttpStatus.FORBIDDEN);
                }
            }

            return chain.filter(exchange);
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);

        // Postman'da görebilmek için header ekliyoruz
        response.getHeaders().add("X-Error-Reason", err);

        System.out.println("Hata: " + err + ", Kod: " + httpStatus);
        return response.setComplete();
    }
}