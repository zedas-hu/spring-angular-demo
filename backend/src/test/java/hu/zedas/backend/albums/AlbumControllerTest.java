package hu.zedas.backend.albums;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

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
}
