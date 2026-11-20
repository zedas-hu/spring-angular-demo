package hu.zedas.backend;

import java.util.LinkedHashMap;
import java.util.Map;

import hu.zedas.backend.albums.LogicValidationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;

public abstract class AbstractValidationExceptionHandler {

    private final String invalidDataCode;

    protected AbstractValidationExceptionHandler(String invalidDataCode) {
        this.invalidDataCode = invalidDataCode;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> fieldErrors.putIfAbsent(error.getField(), error.getDefaultMessage()));
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, invalidDataCode);
        problem.setProperty("fieldErrors", fieldErrors);
        return problem;
    }

    @ExceptionHandler(LogicValidationException.class)
    public ProblemDetail handleBusinessValidation(LogicValidationException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(ex.getStatus(), ex.getMessage());
        problem.setProperty("fieldErrors", Map.of(ex.getField(), ex.getMessage()));
        return problem;
    }
}
