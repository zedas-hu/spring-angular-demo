package hu.zedas.backend.albums;

import org.springframework.http.HttpStatus;

public class LogicValidationException extends RuntimeException {
    private final String field;
    private final HttpStatus status;

    public LogicValidationException(String field, String message) {
        this(field, message, HttpStatus.CONFLICT);
    }

    public LogicValidationException(String field, String message, HttpStatus status) {
        super(message);
        this.field = field;
        this.status = status;
    }

    public String getField() {
        return field;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
