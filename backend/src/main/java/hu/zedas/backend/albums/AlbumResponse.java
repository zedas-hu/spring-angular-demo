package hu.zedas.backend.albums;
import java.util.List;
import hu.zedas.backend.tracks.TrackResponse;

public record AlbumResponse(
    Integer albumId,
    String title,
    Integer artistId,
    String artistName,
    List<TrackResponse> tracks
) {
}
