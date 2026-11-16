package hu.zedas.backend.albums;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class AlbumControllerTest {
    @Autowired
    private AlbumController albumController;

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
}
