package hu.zedas.backend.employees;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<EmployeeEntity, Integer> {
    List<EmployeeEntity> findAllByEmailIsNotNullOrderByLastNameAscFirstNameAsc();

    Optional<EmployeeEntity> findFirstByEmailIgnoreCase(String email);
}
