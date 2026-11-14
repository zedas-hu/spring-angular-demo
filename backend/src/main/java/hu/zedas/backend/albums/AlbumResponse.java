package hu.zedas.backend.albums;

public record AlbumResponse(
    Integer albumId,
    String title,
    Integer artistId,
    String artistName
) {
}
