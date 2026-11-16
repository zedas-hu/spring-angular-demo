package hu.zedas.backend.albums;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;

import hu.zedas.backend.tracks.TrackEntity;

class AlbumMapperTest {
    @Test
    void mapsAlbumTracksToResponses() {
        TrackEntity track = mock(TrackEntity.class);
        when(track.getTrackId()).thenReturn(7);
        when(track.getName()).thenReturn("Track");

        AlbumEntity album = mock(AlbumEntity.class);
        when(album.getTracks()).thenReturn(List.of(track));

        AlbumResponse response = AlbumMapper.INSTANCE.toResponse(album);

        assertEquals(1, response.tracks().size());
        assertEquals(7, response.tracks().get(0).trackId());
        assertEquals("Track", response.tracks().get(0).name());
    }
}
