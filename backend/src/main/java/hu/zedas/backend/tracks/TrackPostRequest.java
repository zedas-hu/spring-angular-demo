package hu.zedas.backend.tracks;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class TrackPostRequest {
    @NotBlank(message = "TRACK_NAME_REQUIRED")
    @Size(max = 200, message = "TRACK_NAME_TOO_LONG")
    private String name;

    @NotNull(message = "ALBUM_REQUIRED")
    @Positive(message = "ALBUM_REQUIRED")
    private Integer albumId;

    @NotNull(message = "GENRE_REQUIRED")
    @Positive(message = "GENRE_REQUIRED")
    private Integer genreId;

    @NotNull(message = "MEDIA_TYPE_REQUIRED")
    @Positive(message = "MEDIA_TYPE_REQUIRED")
    private Integer mediaTypeId;

    @Size(max = 220, message = "COMPOSER_TOO_LONG")
    private String composer;

    @NotNull(message = "DURATION_REQUIRED")
    @Min(value = 1000, message = "DURATION_RANGE")
    private Integer milliseconds;

    @NotNull(message = "UNIT_PRICE_INVALID")
    @DecimalMin(value = "0.00", message = "UNIT_PRICE_INVALID")
    @Digits(integer = 8, fraction = 2, message = "UNIT_PRICE_INVALID")
    private BigDecimal unitPrice;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name == null ? null : name.strip();
    }

    public Integer getAlbumId() {
        return albumId;
    }

    public void setAlbumId(Integer albumId) {
        this.albumId = albumId;
    }

    public Integer getGenreId() {
        return genreId;
    }

    public void setGenreId(Integer genreId) {
        this.genreId = genreId;
    }

    public Integer getMediaTypeId() {
        return mediaTypeId;
    }

    public void setMediaTypeId(Integer mediaTypeId) {
        this.mediaTypeId = mediaTypeId;
    }

    public String getComposer() {
        return composer;
    }

    public void setComposer(String composer) {
        this.composer = composer == null || composer.isBlank() ? null : composer.strip();
    }

    public Integer getMilliseconds() {
        return milliseconds;
    }

    public void setMilliseconds(Integer milliseconds) {
        this.milliseconds = milliseconds;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }
}
