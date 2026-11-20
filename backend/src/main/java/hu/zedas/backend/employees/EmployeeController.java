package hu.zedas.backend.employees;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
    private final EmployeeRepository employeeRepository;

    public EmployeeController(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @GetMapping
    public List<EmployeeResponse> getEmployees() {
        return employeeRepository.findAllByEmailIsNotNullOrderByLastNameAscFirstNameAsc().stream()
                .filter(employee -> !employee.getEmail().isBlank())
                .map(employee -> new EmployeeResponse(
                        employee.getEmployeeId(),
                        employee.getFirstName(),
                        employee.getLastName(),
                        employee.getEmail()))
                .toList();
    }
}
