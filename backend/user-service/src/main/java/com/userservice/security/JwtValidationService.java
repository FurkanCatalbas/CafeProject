package com.userservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

/**
 * Aynı HS256 gizli anahtarı auth-service ve gateway ile paylaşır; Bearer jetonu
 * doğrudan user-service'e gelen isteklerde (gateway dışı) kimlik kurar.
 */
@Service
public class JwtValidationService {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public boolean isTokenValid(String token, String userName) {
        final String tokenUserName = extractUsername(token);
        return tokenUserName != null && tokenUserName.equals(userName) && !isTokenExpired(token);
    }

    public String extractRole(String token) {
        Claims claims = extractAllClaims(token);
        Object raw = claims.get("userObject");
        if (!(raw instanceof Map<?, ?> map)) {
            return null;
        }
        Object role = map.get("role");
        return role != null ? role.toString() : null;
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
