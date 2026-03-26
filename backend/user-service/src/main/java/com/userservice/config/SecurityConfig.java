// user-service/src/main/java/com/project/userservice/config/SecurityConfig.java
package com.userservice.config;

import com.userservice.security.GatewayAuthFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // @PreAuthorize ve @RolesAllowed için şart
public class SecurityConfig {
    @Autowired
    private final GatewayAuthFilter gatewayAuthFilter;

    public SecurityConfig(GatewayAuthFilter gatewayAuthFilter) {
        this.gatewayAuthFilter = gatewayAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // CSRF devre dışı (stateless API)
                .csrf(csrf -> csrf.disable())

                // Session oluşturulmasın
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Basic Auth ve Form Login'i kapat (Gateway hallediyor)
                .httpBasic(basic -> basic.disable())
                .formLogin(form -> form.disable())

                // Yetkilendirme kuralları
                .authorizeHttpRequests(auth -> auth
                        // Public endpoint'ler (eğer varsa)
                        .requestMatchers("/api/auth/**").permitAll()

                        // Diğer tüm istekler authenticated olmalı
                        // Ama Gateway zaten header eklediği için bu otomatik geçecek
                        .anyRequest().authenticated()
                )

                // Custom filter'ımızı ekle (UsernamePasswordAuthenticationFilter'dan ÖNCE)
                .addFilterBefore(gatewayAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}