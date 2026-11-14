package hu.zedas.backend.tracks;

import java.math.BigDecimal;

public record TrackResponse(
    Integer trackId,
    String name,
    Integer albumId,
    String albumTitle,
    Integer mediaTypeId,
    Integer genreId,
    String composer,
    Integer milliseconds,
    Integer bytes,
    BigDecimal unitPrice
) {
}
