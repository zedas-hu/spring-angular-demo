package hu.zedas.backend.tracks;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.mockito.Mockito;
import hu.zedas.backend.albums.AlbumRepository;
import hu.zedas.backend.genres.GenreRepository;
import hu.zedas.backend.media_types.MediaTypeRepository;

class TrackControllerTest {
    private TrackRepository tracksRepository;
    private AlbumRepository albumRepository;
    private GenreRepository genreRepository;
    private MediaTypeRepository mediaTypeRepository;
    private TrackMapper trackMapper;
    private TrackController trackController;

    @BeforeEach
    void setUp() {
        tracksRepository = Mockito.mock(TrackRepository.class);
        albumRepository = Mockito.mock(AlbumRepository.class);
        genreRepository = Mockito.mock(GenreRepository.class);
        mediaTypeRepository = Mockito.mock(MediaTypeRepository.class);
        trackMapper = Mockito.mock(TrackMapper.class);
        trackController = new TrackController(
                tracksRepository, albumRepository, genreRepository, mediaTypeRepository, trackMapper);
    }

    @Test
    void searchesTrackNameAlbumTitleAndArtistForFiltersWithAtLeastTwoCharacters() {
        Pageable pageable = PageRequest.of(0, 20);
        when(tracksRepository
                .findByNameContainingIgnoreCaseOrAlbum_TitleContainingIgnoreCaseOrAlbum_Artist_NameContainingIgnoreCase(
                        "balls", "balls", "balls", pageable)).thenReturn(Page.empty(pageable));

        trackController.getAllTracks("  balls  ", pageable);

        verify(tracksRepository)
                .findByNameContainingIgnoreCaseOrAlbum_TitleContainingIgnoreCaseOrAlbum_Artist_NameContainingIgnoreCase(
                        "balls", "balls", "balls", pageable);
        verify(tracksRepository, never()).findAll(pageable);
    }

    @Test
    void ignoresFiltersShorterThanTwoCharacters() {
        Pageable pageable = PageRequest.of(0, 20);
        when(tracksRepository.findAll(pageable)).thenReturn(Page.empty(pageable));

        trackController.getAllTracks("a", pageable);
        trackController.getAllTracks(" ", pageable);
        trackController.getAllTracks(null, pageable);

        verify(tracksRepository, times(3)).findAll(pageable);
        verify(tracksRepository, never())
                .findByNameContainingIgnoreCaseOrAlbum_TitleContainingIgnoreCaseOrAlbum_Artist_NameContainingIgnoreCase(
                        anyString(), anyString(), anyString(), eq(pageable));
    }

    @Test
    void returnsNotFoundForUnknownTrackId() {
        when(tracksRepository.findById(404)).thenReturn(Optional.empty());

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class, () -> trackController.getTrackById(404));
        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
        assertEquals("TRACK_NOT_FOUND", error.getReason());
    }
}
