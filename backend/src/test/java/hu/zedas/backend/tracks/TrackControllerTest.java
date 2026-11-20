package hu.zedas.backend.tracks;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
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
    void returnsTrackPagesAsPagedModelWithPageMetadata() throws Exception {
        TrackEntity entity = new TrackEntity();
        TrackResponse response = new TrackResponse(1, "Track", 2, "Album", "Artist", 3, "Rock", 4,
                "MPEG audio file", null, 1000, null, BigDecimal.ONE);
        when(tracksRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(entity), PageRequest.of(0, 20), 1));
        when(trackMapper.toResponse(entity)).thenReturn(response);

        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(trackController)
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();

        mockMvc.perform(get("/api/tracks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].trackId").value(1))
                .andExpect(jsonPath("$.page.size").value(20))
                .andExpect(jsonPath("$.page.number").value(0))
                .andExpect(jsonPath("$.page.totalElements").value(1))
                .andExpect(jsonPath("$.page.totalPages").value(1))
                .andExpect(jsonPath("$.totalPages").doesNotExist());
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
