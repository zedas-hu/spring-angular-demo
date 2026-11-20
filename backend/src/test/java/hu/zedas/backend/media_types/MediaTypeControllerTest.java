package hu.zedas.backend.media_types;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class MediaTypeControllerTest {
    @Test
    void returnsNotFoundForUnknownMediaTypeId() {
        MediaTypeRepository mediaTypeRepository = Mockito.mock(MediaTypeRepository.class);
        when(mediaTypeRepository.findById(404)).thenReturn(Optional.empty());
        MediaTypeController mediaTypeController =
                new MediaTypeController(mediaTypeRepository, Mockito.mock(MediaTypeMapper.class));

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class, () -> mediaTypeController.getMediaTypeById(404));
        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
        assertEquals("MEDIA_TYPE_NOT_FOUND", error.getReason());
    }
}
