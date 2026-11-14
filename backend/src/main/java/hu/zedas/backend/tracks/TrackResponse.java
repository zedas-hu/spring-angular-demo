package hu.zedas.backend.tracks;

import java.math.BigDecimal;

public record TrackResponse(
    Integer trackId,
    String name,
    Integer albumId,
    String albumTitle,
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
