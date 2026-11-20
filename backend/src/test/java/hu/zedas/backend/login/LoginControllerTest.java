package hu.zedas.backend.login;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.web.server.ResponseStatusException;

import hu.zedas.backend.employees.EmployeeEntity;
import hu.zedas.backend.employees.EmployeeRepository;

class LoginControllerTest {
    private EmployeeRepository employeeRepository;
    private CurrentUserMapper currentUserMapper;
    private LoginController loginController;

    @BeforeEach
    void setUp() {
        employeeRepository = mock(EmployeeRepository.class);
        currentUserMapper = mock(CurrentUserMapper.class);
        loginController = new LoginController(employeeRepository, currentUserMapper);
    }

    @Test
    void storesTheSelectedEmployeeAsCurrentUserInTheSession() {
        EmployeeEntity employee = employee("Jane", "Doe", "jane@example.com");
        when(employeeRepository.findFirstByEmailIgnoreCase("jane@example.com")).thenReturn(Optional.of(employee));
        MockHttpServletRequest request = new MockHttpServletRequest();

        LoginSessionResponse response = loginController.login(new LoginRequest(" jane@example.com "), request);

        assertEquals("jane@example.com", response.email());
        assertEquals(
                new CurrentUser(1, "Jane", "Doe", "jane@example.com"),
                request.getSession(false).getAttribute("currentUser"));
        when(currentUserMapper.toResponse(new CurrentUser(1, "Jane", "Doe", "jane@example.com")))
                .thenReturn(new CurrentUserResponse(1, "Jane", "Doe", "jane@example.com"));
        assertEquals(
                new CurrentUserResponse(1, "Jane", "Doe", "jane@example.com"),
                loginController.getSession(request));
    }

    @Test
    void doesNotCreateASessionForAnUnknownEmployee() {
        when(employeeRepository.findFirstByEmailIgnoreCase("unknown@example.com")).thenReturn(Optional.empty());
        MockHttpServletRequest request = new MockHttpServletRequest();

        assertThrows(ResponseStatusException.class,
                () -> loginController.login(new LoginRequest("unknown@example.com"), request));

        assertNull(request.getSession(false));
    }

    @Test
    void returnsAnEmptyCurrentUserWhenThereIsNoSession() {
        assertEquals(
                CurrentUserResponse.empty(),
                loginController.getSession(new MockHttpServletRequest()));
    }

    @Test
    void returnsAnEmptyCurrentUserWhenSessionHasNoCurrentUser() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.getSession(true);

        assertEquals(CurrentUserResponse.empty(), loginController.getSession(request));
    }

    @Test
    void logoutInvalidatesTheSession() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpSession session = (MockHttpSession) request.getSession(true);

        var response = loginController.logout(request);

        assertTrue(session.isInvalid());
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    }

    @Test
    void logoutSucceedsWhenThereIsNoSession() {
        var response = loginController.logout(new MockHttpServletRequest());

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    }

    private EmployeeEntity employee(String firstName, String lastName, String email) {
        EmployeeEntity employee = mock(EmployeeEntity.class);
        when(employee.getEmployeeId()).thenReturn(1);
        when(employee.getFirstName()).thenReturn(firstName);
        when(employee.getLastName()).thenReturn(lastName);
        when(employee.getEmail()).thenReturn(email);
        return employee;
    }
}
