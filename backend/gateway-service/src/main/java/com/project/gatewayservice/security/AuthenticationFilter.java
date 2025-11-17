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

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private JwtService jwtService;

    public AuthenticationFilter() {
        super(Config.class);
    }

    public static class Config {
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            // İzin verilen yollar
            if (request.getPath().toString().equals("/actuator")) {
                return chain.filter(exchange);
            }

            // Authorization Header kontrolü
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return onError(exchange, "No authorization header", HttpStatus.UNAUTHORIZED);
            }

            String authorizationHeader = request.getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);

            if (!authorizationHeader.startsWith("Bearer ")) {
                return onError(exchange, "Authorization header must start with 'Bearer '", HttpStatus.UNAUTHORIZED);
            }

            String token = authorizationHeader.substring("Bearer ".length());

            // JWT doğrulama
            if (!isJwtValid(token)) {
                return onError(exchange, "JWT token is not valid", HttpStatus.UNAUTHORIZED);
            }

            return chain.filter(exchange);
        };
    }

    private boolean isJwtValid(String jwt) {
        try {
            // Token'dan kullanıcı adı çıkar ve doğrula
            String username = jwtService.extractUsername(jwt);

            // Kullanıcı adının geçerli olduğundan emin ol
            if (username == null || username.isEmpty()) {
                return false;
            }

            // Token geçerliliğini kontrol et
            return jwtService.isTokenValid(jwt, username);
        } catch (Exception ex) {
            return false;
        }
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);

        return response.setComplete();
    }
}
