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
            String path = request.getURI().getPath();
            String method = request.getMethod().name();

            // 1. Route secured mı? Değilse (login/register) direkt geç
            if (!validator.isSecured.test(request)) {
                return chain.filter(exchange);
            }

            // 2. Token Validasyonu (Mevcut kodunuz)
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return onError(exchange, "ERR-001: Token eksik", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange, "ERR-002: Format hatalı", HttpStatus.BAD_REQUEST);
            }

            String token = authHeader.substring(7);
            String userId;
            String role;

            try {
                userId = jwtService.extractUserId(token);
                role = normalizeRole(jwtService.extractRole(token));
                if (!jwtService.isTokenValid(token, jwtService.extractUsername(token))) {
                    return onError(exchange, "ERR-003: Token geçersiz", HttpStatus.FORBIDDEN);
                }
            } catch (Exception e) {
                return onError(exchange, "ERR-004: Parse hatası", HttpStatus.FORBIDDEN);
            }

            // 3. ✅ DİNAMİK ROLE KONTROLÜ (Metadata Okuma)
            // Route objesini exchange'den çekiyoruz
            Route route = exchange.getAttribute("org.springframework.cloud.gateway.support.ServerWebExchangeUtils.gatewayRoute");

            if (route != null && route.getMetadata() != null) {
                // Metadata içindeki "authorizedRoles" haritasını tarıyoruz
                for (Map.Entry<String, Object> entry : route.getMetadata().entrySet()) {
                    String key = entry.getKey();

                    // Sadece bizim formatımıza uygun anahtarları işle: "authorizedRoles.METHOD.PATH"
                    if (key != null && key.startsWith("authorizedRoles.")) {
                        String[] parts = key.split("\\.", 3); // Max 3 parçaya böl
                        if (parts.length == 3) {
                            String configMethod = parts[1];       // Örn: DELETE
                            String configPathPattern = parts[2];  // Örn: /api/users/**
                            String allowedRolesRaw = (String) entry.getValue(); // Örn: "ADMIN,MANAGER"

                            // Metod eşleşiyor mu VE Path pattern ile istek yolu uyuşuyor mu?
                            if (configMethod.equalsIgnoreCase(method) && pathMatcher.match(configPathPattern, path)) {

                                // Kullanıcının rolü, izin verilenler listesinde var mı?
                                List<UserRole> allowedRoles = Arrays.stream(allowedRolesRaw.split(","))
                                        .map(this::resolveRole)
                                        .filter(Objects::nonNull)
                                        .toList();
                                UserRole requestRole = resolveRole(role);
                                if (requestRole == null || !allowedRoles.contains(requestRole)) {
                                    return onError(exchange, "ERR-005: Yetkisiz Erişim. Gereken roller: " + allowedRolesRaw, HttpStatus.FORBIDDEN);
                                }
                                // Kural bulundu ve kullanıcı yetkili, döngüden çıkabiliriz
                                break;
                            }
                        }
                    }
                }
            }

            // 4. Başarılı ise isteği servise ilet (Header'ları zenginleştirerek)
            ServerHttpRequest mutatedRequest = request.mutate()
                    .header("X-User-Id", userId != null ? userId : "0")
                    .header("X-User-Role", role != null ? role : UserRole.CUSTOMER.getValue())
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
