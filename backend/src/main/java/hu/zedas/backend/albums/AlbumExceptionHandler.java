package hu.zedas.backend.albums;

import hu.zedas.backend.AbstractValidationExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(assignableTypes = AlbumController.class)
public class AlbumExceptionHandler extends AbstractValidationExceptionHandler {

    // Ez a AlbumPostRequest objektum létrehozásakor keletkező validációs hibáknál keletkezik.
    public AlbumExceptionHandler() {
        super("INVALID_ALBUM_DATA");
    }
}
