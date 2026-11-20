package hu.zedas.backend.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import hu.zedas.backend.login.CurrentUser;
import jakarta.servlet.http.HttpServletResponse;

class SessionAuthenticationInterceptorTest {
    private final SessionAuthenticationInterceptor interceptor = new SessionAuthenticationInterceptor();

    @Test
    void rejectsMutationRequestsWithoutAValidSession() throws Exception {
        for (String method : List.of("POST", "PUT", "PATCH", "DELETE")) {
            MockHttpServletRequest request = new MockHttpServletRequest(method, "/api/albums");
            MockHttpServletResponse response = new MockHttpServletResponse();

            assertFalse(interceptor.preHandle(request, response, new Object()), method);
            assertEquals(HttpServletResponse.SC_UNAUTHORIZED, response.getStatus(), method);
        }
    }

    @Test
    void allowsMutationRequestsWithACurrentUserInTheSession() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("PATCH", "/api/albums/1");
        request.getSession(true).setAttribute(
                CurrentUser.SESSION_ATTRIBUTE,
                new CurrentUser(1, "Jane", "Doe", "jane@example.com"));

        assertTrue(interceptor.preHandle(request, new MockHttpServletResponse(), new Object()));
    }

    @Test
    void allowsLoginAndLogoutWithoutAValidSession() throws Exception {
        MockHttpServletRequest loginRequest = new MockHttpServletRequest("POST", "/api/login");
        MockHttpServletRequest logoutRequest = new MockHttpServletRequest("DELETE", "/api/login/session");

        assertTrue(interceptor.preHandle(loginRequest, new MockHttpServletResponse(), new Object()));
        assertTrue(interceptor.preHandle(logoutRequest, new MockHttpServletResponse(), new Object()));
    }

    @Test
    void allowsReadRequestsWithoutASession() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/albums");

        assertTrue(interceptor.preHandle(request, new MockHttpServletResponse(), new Object()));
    }
}
