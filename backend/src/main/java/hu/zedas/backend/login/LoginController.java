package hu.zedas.backend.login;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import hu.zedas.backend.employees.EmployeeEntity;
import hu.zedas.backend.employees.EmployeeRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/login")
public class LoginController {
    private final EmployeeRepository employeeRepository;
    private final CurrentUserMapper currentUserMapper;

    public LoginController(EmployeeRepository employeeRepository, CurrentUserMapper currentUserMapper) {
        this.employeeRepository = employeeRepository;
        this.currentUserMapper = currentUserMapper;
    }

    @GetMapping("/session")
    public CurrentUserResponse getSession(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return CurrentUserResponse.empty();
        }

        var currentUser = session.getAttribute(CurrentUser.SESSION_ATTRIBUTE);
        return currentUser instanceof CurrentUser user
                ? currentUserMapper.toResponse(user)
                : CurrentUserResponse.empty();
    }

    @DeleteMapping("/session")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public LoginSessionResponse login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request) {
        String email = loginRequest.email().trim();
        EmployeeEntity employee = employeeRepository.findFirstByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "EMPLOYEE_NOT_FOUND"));

        request.getSession(true).setAttribute(
                CurrentUser.SESSION_ATTRIBUTE,
                new CurrentUser(
                        employee.getEmployeeId(),
                        employee.getFirstName(),
                        employee.getLastName(),
                        employee.getEmail()));
        return new LoginSessionResponse(employee.getEmail());
    }
}
