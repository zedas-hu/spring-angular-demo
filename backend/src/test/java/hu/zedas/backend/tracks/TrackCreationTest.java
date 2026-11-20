package hu.zedas.backend.tracks;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import hu.zedas.backend.albums.AlbumEntity;
import hu.zedas.backend.albums.AlbumRepository;
import hu.zedas.backend.albums.LogicValidationException;
import hu.zedas.backend.genres.GenreRepository;
import hu.zedas.backend.media_types.MediaTypeRepository;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
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

    @Autowired
    private TrackRepository tracksRepository;

    @Autowired
    private Validator validator;

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
                LogicValidationException.class,
                () -> trackController.createTrack(request)).getMessage());

        request.setAlbumId(otherAlbum.getAlbumId());
        assertEquals(HttpStatus.CREATED, trackController.createTrack(request).getStatusCode());
    }

    @Test
    @Transactional
    void updatesTrackDetailsWithoutTreatingItsOwnNameAsADuplicate() {
        TrackEntity existing = tracksRepository.findAll().get(0);
        var album = albumRepository.findAll().get(0);
        var genre = genreRepository.findAll().get(0);
        var mediaType = mediaTypeRepository.findAll().get(0);
        TrackPostRequest request = new TrackPostRequest();
        request.setName(existing.getName());
        request.setAlbumId(album.getAlbumId());
        request.setGenreId(genre.getGenreId());
        request.setMediaTypeId(mediaType.getMediaTypeId());
        request.setComposer("Updated composer");
        request.setMilliseconds(240000);
        request.setUnitPrice(new java.math.BigDecimal("1.25"));

        TrackResponse response = trackController.updateTrack(existing.getTrackId(), request);

        assertEquals(existing.getTrackId(), response.trackId());
        assertEquals(existing.getName(), response.name());
        assertEquals(album.getAlbumId(), response.albumId());
        assertEquals(genre.getGenreId(), response.genreId());
        assertEquals(mediaType.getMediaTypeId(), response.mediaTypeId());
        assertEquals("Updated composer", response.composer());
        assertEquals(240000, response.milliseconds());
        assertEquals(new java.math.BigDecimal("1.25"), response.unitPrice());
    }

    @Test
    @Transactional
    void updatesDetailsOfTracksThatAlreadyShareTheirNameButRejectsRenamingThemToADuplicate() {
        TrackEntity duplicate = tracksRepository.findAll().stream()
                .filter(track -> track.getAlbum() != null)
                .filter(track -> tracksRepository.existsByAlbum_AlbumIdAndNameIgnoreCaseAndTrackIdNot(
                        track.getAlbum().getAlbumId(), track.getName(), track.getTrackId()))
                .findFirst()
                .orElseThrow();
        TrackPostRequest request = new TrackPostRequest();
        request.setName(duplicate.getName());
        request.setAlbumId(duplicate.getAlbum().getAlbumId());
        request.setGenreId(duplicate.getGenre().getGenreId());
        request.setMediaTypeId(duplicate.getMediaType().getMediaTypeId());
        request.setComposer("Composer of duplicate");
        request.setMilliseconds(duplicate.getMilliseconds());
        request.setUnitPrice(duplicate.getUnitPrice());

        assertEquals("Composer of duplicate",
                trackController.updateTrack(duplicate.getTrackId(), request).composer());

        request.setName(duplicate.getName().toUpperCase());
        assertEquals("TRACK_NAME_DUPLICATION", assertThrows(
                LogicValidationException.class,
                () -> trackController.updateTrack(duplicate.getTrackId(), request)).getMessage());
    }

    @Test
    void listsAndGetsTracksWithLazyRelationsWhenRepositorySessionIsClosed() {
        var page = trackController.getAllTracks(null, PageRequest.of(0, 20));
        TrackResponse listedTrack = page.getContent().stream()
                .filter(track -> track.albumId() != null && track.genreId() != null && track.mediaTypeId() != null)
                .findFirst()
                .orElseThrow();

        TrackResponse details = trackController.getTrackById(listedTrack.trackId());

        assertEquals(listedTrack, details);
        assertNotNull(details.albumTitle());
        assertNotNull(details.artistName());
        assertNotNull(details.genreName());
        assertNotNull(details.mediaTypeName());
    }

    @Test
    @Transactional
    void deletesTrackAndReturnsNotFoundWhenItDoesNotExist() {
        TrackEntity referenced = tracksRepository.findAll().stream()
                .filter(track -> tracksRepository.countInvoiceItems(track.getTrackId()) > 0)
                .findFirst()
                .orElseThrow();
        LogicValidationException referencedError = assertThrows(
                LogicValidationException.class,
                () -> trackController.deleteTrack(referenced.getTrackId()));
        assertEquals("TRACK_DELETE_REFERENCED", referencedError.getMessage());

        TrackEntity existing = tracksRepository.findAll().stream()
                .filter(track -> tracksRepository.countInvoiceItems(track.getTrackId()) == 0)
                .findFirst()
                .orElseThrow();
        Integer trackId = existing.getTrackId();

        assertTrue(tracksRepository.countPlaylistReferences(trackId) > 0);
        assertEquals(HttpStatus.NO_CONTENT, trackController.deleteTrack(trackId).getStatusCode());
        assertFalse(tracksRepository.existsById(trackId));
        assertEquals(0, tracksRepository.countPlaylistReferences(trackId));
        assertEquals(HttpStatus.NOT_FOUND, trackController.deleteTrack(trackId).getStatusCode());
    }

    @Test
    void requiresDurationOfAtLeastOneSecond() {
        TrackPostRequest request = new TrackPostRequest();

        request.setMilliseconds(999);
        var violations = validator.validateProperty(request, "milliseconds");
        assertEquals(1, violations.size());
        assertEquals("DURATION_RANGE", violations.iterator().next().getMessage());

        request.setMilliseconds(1000);
        assertTrue(validator.validateProperty(request, "milliseconds").isEmpty());
    }
}
