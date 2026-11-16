package hu.zedas.backend.tracks;

import java.math.BigDecimal;
import java.util.List;

import hu.zedas.backend.artists.ArtistResponse;

public record TrackResponse(
    Integer trackId,
    String name,
    Integer albumId,
    String albumTitle,
    List<ArtistResponse> artists,
    Integer genreId,
    String genreName,
    Integer mediaTypeId,
    String mediaTypeName,
    String composer,
    Integer milliseconds,
    Integer bytes,
    BigDecimal unitPrice
) {
}
