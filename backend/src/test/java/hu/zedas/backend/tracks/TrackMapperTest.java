package hu.zedas.backend.tracks;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;

import hu.zedas.backend.albums.AlbumEntity;
import hu.zedas.backend.artists.ArtistEntity;
import hu.zedas.backend.artists.ArtistResponse;

class TrackMapperTest {
    @Test
    void mapsAlbumArtistAsArtistsArray() {
        ArtistEntity artist = mock(ArtistEntity.class);
        when(artist.getArtistId()).thenReturn(7);
        when(artist.getName()).thenReturn("Artist");

        AlbumEntity album = mock(AlbumEntity.class);
        when(album.getAlbumId()).thenReturn(3);
        when(album.getTitle()).thenReturn("Album");
        when(album.getArtist()).thenReturn(artist);

        TrackEntity track = mock(TrackEntity.class);
        when(track.getAlbum()).thenReturn(album);

        TrackResponse response = TrackMapper.INSTANCE.toResponse(track);

        assertEquals(List.of(new ArtistResponse(7, "Artist")), response.artists());
    }

    @Test
    void returnsEmptyArtistsArrayWhenTrackHasNoAlbum() {
        TrackEntity track = mock(TrackEntity.class);

        TrackResponse response = TrackMapper.INSTANCE.toResponse(track);

        assertTrue(response.artists().isEmpty());
    }
}
