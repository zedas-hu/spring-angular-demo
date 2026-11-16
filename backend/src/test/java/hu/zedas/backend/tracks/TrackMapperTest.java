package hu.zedas.backend.tracks;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;

import hu.zedas.backend.albums.AlbumEntity;
import hu.zedas.backend.artists.ArtistEntity;

class TrackMapperTest {
    @Test
    void mapsAlbumArtistAsArtistName() {
        ArtistEntity artist = mock(ArtistEntity.class);
        when(artist.getName()).thenReturn("Artist");

        AlbumEntity album = mock(AlbumEntity.class);
        when(album.getAlbumId()).thenReturn(3);
        when(album.getTitle()).thenReturn("Album");
        when(album.getArtist()).thenReturn(artist);

        TrackEntity track = mock(TrackEntity.class);
        when(track.getAlbum()).thenReturn(album);

        TrackResponse response = TrackMapper.INSTANCE.toResponse(track);

        assertEquals("Artist", response.artistName());
    }

    @Test
    void returnsNullArtistNameWhenTrackHasNoAlbum() {
        TrackEntity track = mock(TrackEntity.class);

        TrackResponse response = TrackMapper.INSTANCE.toResponse(track);

        assertNull(response.artistName());
    }
}
