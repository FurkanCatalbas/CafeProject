package com.wise.core.security;

import com.wise.core.enums.UserRole;
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
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        RequiredRole requiredRole = handlerMethod.getMethodAnnotation(RequiredRole.class);
        if (requiredRole == null) {
            requiredRole = handlerMethod.getBeanType().getAnnotation(RequiredRole.class);
        }

        if (requiredRole == null) {
            return true;
        }

        String userRoleHeader = request.getHeader("X-User-Role");
        UserRole userRole = resolveUserRole(userRoleHeader);

        if (userRole != null) {
            boolean hasAccess = Arrays.stream(requiredRole.value())
                    .anyMatch(role -> role == userRole);

            if (hasAccess) {
                return true;
            }
        }

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"error\": \"Bu islem icin yetkiniz bulunmuyor. Gerekli rol: "
                + Arrays.toString(requiredRole.value()) + "\"}");

        return false;
    }

    private UserRole resolveUserRole(String userRole) {
        if (userRole == null || userRole.isBlank()) {
            return null;
        }
        try {
            return UserRole.fromValue(userRole.trim());
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }
}
