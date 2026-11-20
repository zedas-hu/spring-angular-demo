package hu.zedas.backend.tracks;

import hu.zedas.backend.AbstractValidationExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(assignableTypes = TrackController.class)
public class TrackExceptionHandler extends AbstractValidationExceptionHandler {

    public TrackExceptionHandler() {
        super("INVALID_TRACK_DATA");
    }
}
