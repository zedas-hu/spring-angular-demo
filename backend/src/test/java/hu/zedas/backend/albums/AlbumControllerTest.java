package hu.zedas.backend.albums;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.HashSet;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

import hu.zedas.backend.KeyResponse;
import hu.zedas.backend.artists.ArtistRepository;
import hu.zedas.backend.tracks.TrackRepository;

@SpringBootTest
class AlbumControllerTest {
    @Autowired
    private AlbumController albumController;

    @Autowired
    private ArtistRepository artistRepository;

    @Autowired
    private TrackRepository trackRepository;
    
    @Autowired
    private AlbumRepository albumRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void albumListAndDetailsIncludeTheirTracks() {
        AlbumResponse albumWithTracks = albumController.getAllAlbums().stream()
                .filter(album -> !album.tracks().isEmpty())
                .findFirst()
                .orElseThrow();

        assertFalse(albumWithTracks.tracks().isEmpty());

        var albumDetails = albumController.getAlbumById(albumWithTracks.albumId());

        assertEquals(HttpStatus.OK, albumDetails.getStatusCode());
        AlbumResponse albumDetailBody = albumDetails.getBody();
        assertNotNull(albumDetailBody);
        assertEquals(albumWithTracks.tracks(), albumDetailBody.tracks());
    }

    @Test
    void albumKeysListEveryAlbumAsIdAndTitle() {
        var expected = albumRepository.findAll().stream()
                .map(album -> new KeyResponse(album.getAlbumId(), album.getTitle()))
                .collect(Collectors.toSet());

        var keys = albumController.getAllAlbumKeys();

        assertEquals(expected.size(), keys.size());
        assertEquals(expected, new HashSet<>(keys));
    }

    @Test
    @Transactional
    void createsAlbumWithPostedArtistAndDatabaseGeneratedId() {
        Integer previousSequence = jdbcTemplate.queryForObject(
                "SELECT COALESCE((SELECT seq FROM sqlite_sequence WHERE name = 'albums'), 0)",
                Integer.class);
        var artist = artistRepository.findAll().get(0);
        AlbumPostRequest request = new AlbumPostRequest();
        request.setArtistName(artist.getName());
        request.setArtistId(artist.getArtistId());
        request.setTitle("New album");

        var response = albumController.createAlbum(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(previousSequence + 1, response.getBody().albumId());
        assertEquals(artist.getArtistId(), response.getBody().artistId());
        assertEquals("New album", response.getBody().title());
        assertEquals(response.getBody().albumId(), jdbcTemplate.queryForObject(
                "SELECT seq FROM sqlite_sequence WHERE name = 'albums'", Integer.class));
    }

    @Test
    @Transactional
    void createsNewArtistWhenArtistNameIsUnknown() {
        AlbumPostRequest request = new AlbumPostRequest();
        request.setArtistName("Unknown Artist For Test");
        request.setTitle("Album of a new artist");

        var response = albumController.createAlbum(request);

        var createdArtist = artistRepository.findFirstByName("Unknown Artist For Test").orElseThrow();
        assertEquals(createdArtist.getArtistId(), response.getBody().artistId());
    }

    @Test
    @Transactional
    void createsNewArtistWhenNoArtistIdIsProvidedEvenIfTheNameAlreadyExists() {
        var existingArtist = artistRepository.findAll().get(0);
        AlbumPostRequest request = new AlbumPostRequest();
        request.setArtistName(existingArtist.getName());
        request.setTitle("Album for a new artist with a matching name");

        var response = albumController.createAlbum(request);

        assertFalse(response.getBody().artistId().equals(existingArtist.getArtistId()));
        assertEquals(existingArtist.getName(), artistRepository.findById(response.getBody().artistId())
                .orElseThrow().getName());
    }

    @Test
    @Transactional
    void rejectsUnknownArtistId() {
        AlbumPostRequest request = new AlbumPostRequest();
        request.setArtistId(Integer.MAX_VALUE);
        request.setArtistName("Unknown Artist");
        request.setTitle("Album with an invalid artist id");

        var exception = assertThrows(LogicValidationException.class,
                () -> albumController.createAlbum(request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals("artistId", exception.getField());
    }

    @Test
    @Transactional
    void rejectsDuplicateAlbumTitle() {
        AlbumPostRequest request = new AlbumPostRequest();
        request.setArtistName("Any Artist");
        request.setTitle(albumController.getAllAlbums().get(0).title());

        assertThrows(LogicValidationException.class, () -> albumController.createAlbum(request));
    }

    @Test
    @Transactional
    void deletesAlbumAndItsTracks() {
        var album = albumController.getAllAlbums().stream()
                .filter(candidate -> !candidate.tracks().isEmpty())
                .filter(candidate -> trackRepository.countInvoiceItemsByAlbumId(candidate.albumId()) == 0)
                .findFirst()
                .orElseThrow();
        var trackIds = album.tracks().stream().map(track -> track.trackId()).toList();

        var response = albumController.deleteAlbum(album.albumId());

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        assertFalse(albumRepository.existsById(album.albumId()));
        assertFalse(trackIds.stream().anyMatch(trackRepository::existsById));
    }

    @Test
    @Transactional
    void rejectsDeletingAlbumWithInvoicedTracks() {
        var album = albumController.getAllAlbums().stream()
                .filter(candidate -> trackRepository.countInvoiceItemsByAlbumId(candidate.albumId()) > 0)
                .findFirst()
                .orElseThrow();

        var exception = assertThrows(
                LogicValidationException.class,
                () -> albumController.deleteAlbum(album.albumId()));

        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
        assertEquals("albumId", exception.getField());
        assertTrue(albumRepository.existsById(album.albumId()));
    }
}
