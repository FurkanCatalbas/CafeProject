package com.project.gatewayservice.security;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;

import java.util.List;
import java.util.function.Predicate;

@Component
public class RouteValidator {
    private static final AntPathMatcher pathMatcher = new AntPathMatcher();

    public static final List<String> openApiEndpoints = List.of(
            "/auth-service/api/auth/register",
            "/auth-service/api/auth/token",
            "/auth-service/api/auth/refresh-token",
            "/auth-service/auth/token",
            "/eureka"
    );

    public Predicate<ServerHttpRequest> isSecured =
            request -> {
                String path = request.getURI().getPath(); // Bu gateway sonrası path
                return openApiEndpoints
                        .stream()
                        .noneMatch(uri -> path.startsWith(uri)); // matchStart yerine startsWith kullanabilirsin
            };
}
