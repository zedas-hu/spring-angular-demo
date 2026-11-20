package hu.zedas.backend.security;

import java.io.IOException;
import java.util.Set;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import hu.zedas.backend.login.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Component
public class SessionAuthenticationInterceptor implements HandlerInterceptor {
    private static final Set<String> PROTECTED_METHODS = Set.of("POST", "PUT", "PATCH", "DELETE");
    private static final String LOGIN_PATH = "/api/login";
    private static final String LOGOUT_PATH = "/api/login/session";

    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler) throws IOException {
        String method = request.getMethod();
        String path = request.getRequestURI().substring(request.getContextPath().length());
        if (!PROTECTED_METHODS.contains(method) || isPublicMutation(method, path))
            return true;

        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute(CurrentUser.SESSION_ATTRIBUTE) instanceof CurrentUser)
            return true;

        response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
        return false;
    }

    private boolean isPublicMutation(String method, String path) {
        return ("POST".equals(method) && LOGIN_PATH.equals(path))
                || ("DELETE".equals(method) && LOGOUT_PATH.equals(path));
    }
}
