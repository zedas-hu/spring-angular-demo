package hu.zedas.backend.genres;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class GenreControllerTest {
    @Test
    void returnsNotFoundForUnknownGenreId() {
        GenreRepository genreRepository = Mockito.mock(GenreRepository.class);
        when(genreRepository.findById(404)).thenReturn(Optional.empty());
        GenreController genreController = new GenreController(genreRepository, Mockito.mock(GenreMapper.class));

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class, () -> genreController.getGenreById(404));
        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
        assertEquals("GENRE_NOT_FOUND", error.getReason());
    }
}
