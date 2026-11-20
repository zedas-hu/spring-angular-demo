package hu.zedas.backend.employees;

public record EmployeeResponse(
        Integer employeeId,
        String firstName,
        String lastName,
        String email) {
}
