package hu.zedas.backend.tracks;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import hu.zedas.backend.albums.AlbumEntity;
import hu.zedas.backend.albums.AlbumRepository;
import hu.zedas.backend.albums.BusinessValidationException;
import hu.zedas.backend.genres.GenreRepository;
import hu.zedas.backend.media_types.MediaTypeRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
class TrackCreationTest {
    @Autowired
    private TrackController trackController;

    @Autowired
    private AlbumRepository albumRepository;

    @Autowired
    private GenreRepository genreRepository;

    @Autowired
    private MediaTypeRepository mediaTypeRepository;

    @Test
    @Transactional
    void createsTrackWithCurrentAlbum() {
        var album = albumRepository.findAll().get(0);
        var genre = genreRepository.findAll().get(0);
        var mediaType = mediaTypeRepository.findAll().get(0);
        TrackPostRequest request = new TrackPostRequest();
        request.setName("New track");
        request.setAlbumId(album.getAlbumId());
        request.setGenreId(genre.getGenreId());
        request.setMediaTypeId(mediaType.getMediaTypeId());
        request.setComposer("Composer");
        request.setMilliseconds(225000);
        request.setUnitPrice(new java.math.BigDecimal("0.99"));

        var response = trackController.createTrack(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("New track", response.getBody().name());
        assertEquals(album.getAlbumId(), response.getBody().albumId());
        assertEquals(genre.getGenreId(), response.getBody().genreId());
        assertEquals(mediaType.getMediaTypeId(), response.getBody().mediaTypeId());
        assertEquals(225000, response.getBody().milliseconds());
    }

    @Test
    @Transactional
    void rejectsDuplicateTrackNamesOnlyWithinTheSameAlbum() {
        var albums = albumRepository.findAll();
        AlbumEntity album = albums.get(0);
        AlbumEntity otherAlbum = albums.stream()
                .filter(candidate -> !candidate.getAlbumId().equals(album.getAlbumId()))
                .findFirst()
                .orElseThrow();
        var genre = genreRepository.findAll().get(0);
        var mediaType = mediaTypeRepository.findAll().get(0);
        TrackPostRequest request = new TrackPostRequest();
        request.setName("Duplicate test track");
        request.setAlbumId(album.getAlbumId());
        request.setGenreId(genre.getGenreId());
        request.setMediaTypeId(mediaType.getMediaTypeId());
        request.setMilliseconds(225000);
        request.setUnitPrice(new java.math.BigDecimal("0.99"));

        trackController.createTrack(request);
        assertEquals("TRACK_NAME_DUPLICATION", assertThrows(
                BusinessValidationException.class,
                () -> trackController.createTrack(request)).getMessage());

        request.setAlbumId(otherAlbum.getAlbumId());
        assertEquals(HttpStatus.CREATED, trackController.createTrack(request).getStatusCode());
    }
}
