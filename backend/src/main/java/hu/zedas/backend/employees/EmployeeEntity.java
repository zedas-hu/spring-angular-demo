package hu.zedas.backend.employees;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity(name = "employees")
public class EmployeeEntity {
    @Id
    @Column(name = "EmployeeId")
    private Integer employeeId;

    @Column(name = "FirstName", nullable = false, length = 40)
    private String firstName;

    @Column(name = "LastName", nullable = false, length = 20)
    private String lastName;

    @Column(name = "Email", length = 60)
    private String email;

    protected EmployeeEntity() {
    }

    public Integer getEmployeeId() {
        return employeeId;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }
}
