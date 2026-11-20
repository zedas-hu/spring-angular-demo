package hu.zedas.backend.employees;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class EmployeeControllerTest {
    private EmployeeRepository employeeRepository;
    private EmployeeController employeeController;

    @BeforeEach
    void setUp() {
        employeeRepository = mock(EmployeeRepository.class);
        employeeController = new EmployeeController(employeeRepository);
    }

    @Test
    void servesOnlyEmployeesWithNonBlankEmailsFromTheEmployeesEndpoint() throws Exception {
        EmployeeEntity employee = employee("Jane", "Doe", "jane@example.com");
        EmployeeEntity blankEmailEmployee = employee("John", "Smith", " ");
        when(employeeRepository.findAllByEmailIsNotNullOrderByLastNameAscFirstNameAsc())
                .thenReturn(List.of(employee, blankEmailEmployee));

        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(employeeController).build();

        mockMvc.perform(get("/api/employees"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].employeeId").value(1))
                .andExpect(jsonPath("$[0].email").value("jane@example.com"));
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
