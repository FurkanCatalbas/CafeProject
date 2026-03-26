package com.wise.core.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;

@Component
public class RoleInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("INTERCEPTOR TETIKLENDI!");
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;

        RequiredRole requiredRole = handlerMethod.getMethodAnnotation(RequiredRole.class);
        if (requiredRole == null) {
            requiredRole = handlerMethod.getBeanType().getAnnotation(RequiredRole.class);
        }

        if (requiredRole == null) {
            return true;
        }

        // 1. Gateway'den gelen header'ı al
        String userRole = request.getHeader("X-User-Role");
        response.addHeader("X-Debug-Incoming-Role", userRole == null ? "NULL-GELDI" : userRole);
        // DEBUG: Konsoldan ne geldiğini mutlaka kontrol et
        System.out.println("DEBUG - Gelen Rol: [" + userRole + "]");

        if (userRole != null && !userRole.isEmpty()) {
            String trimmedRole = userRole.trim();

            // 2. Karşılaştırmayı daha esnek yap (Büyük/Küçük harf duyarsız)
            boolean hasAccess = Arrays.stream(requiredRole.value())
                    .anyMatch(role -> role.equalsIgnoreCase(trimmedRole));

            if (hasAccess) {
                return true;
            }
        }

        // 3. Yetki yoksa log düş ki neden reddedildiğini anla
        System.out.println("YETKİ REDDEDİLDİ: Beklenen: " + Arrays.toString(requiredRole.value()) + " - Gelen: " + userRole);

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"error\": \"Bu islem icin yetkiniz bulunmuyor. Gerekli rol: " + Arrays.toString(requiredRole.value()) + "\"}");

        return false;
    }
}