package hu.zedas.backend.albums;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

import hu.zedas.backend.artists.ArtistRepository;

@SpringBootTest
class AlbumControllerTest {
    @Autowired
    private AlbumController albumController;

    @Autowired
    private ArtistRepository artistRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void albumListAndDetailsIncludeTheirTracks() {
        AlbumResponse albumWithTracks = albumController.getAllAlbums().stream()
                .filter(album -> !album.tracks().isEmpty())
                .findFirst()
                .orElseThrow();

        assertFalse(albumWithTracks.tracks().isEmpty());

        AlbumResponse albumDetails = albumController.getAlbumById(albumWithTracks.albumId());

        assertEquals(albumWithTracks.tracks(), albumDetails.tracks());
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

        var exception = assertThrows(BusinessValidationException.class,
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

        assertThrows(BusinessValidationException.class, () -> albumController.createAlbum(request));
    }
}
