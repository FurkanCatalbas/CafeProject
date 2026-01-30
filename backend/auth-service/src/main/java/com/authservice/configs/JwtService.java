package com.authservice.configs;

import com.authservice.models.UserDto;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;
    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;
    @Value("${application.security.jwt.refresh-token.expiration}")
    private long refreshExpiration;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDto userDto) {
        return buildToken(userDto, jwtExpiration);
    }

    public String generateRefreshToken(UserDto userDto) {
        return buildToken(userDto, refreshExpiration);
    }

    private String buildToken(UserDto userDto, long expiration) {
        Map<String, Object> mapUser = new HashMap<>();

        // NullPointerException Önlemleri:
        // .NET'teki '??' (null coalescing) mantığıyla kontrolleri yapıyoruz

        mapUser.put("userId", userDto.getId() != null ? userDto.getId().toString() : "0");
        mapUser.put("username", userDto.getUsername());
        mapUser.put("fullName", (userDto.getFirstName() != null ? userDto.getFirstName() : "") + " " +
                (userDto.getLastName() != null ? userDto.getLastName() : ""));

        // UML diyagramındaki type mantığına göre Enum üzerinden değeri alıyoruz
        if (userDto.getRole() != null) {
            mapUser.put("userType", String.valueOf(userDto.getRole().getValue()));
            mapUser.put("roles", new String[]{userDto.getRole().name()});
        } else {
            // Eğer rol null ise varsayılan değerler (Örn: Müşteri)
            mapUser.put("userType", "3");
            mapUser.put("roles", new String[]{"MUSTERI"});
        }

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userObject", mapUser);

        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(userDto.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, String userName) {
        final String tokenUserName = extractUsername(token);
        return (tokenUserName.equals(userName)) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
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