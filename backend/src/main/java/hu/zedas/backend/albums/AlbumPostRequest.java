package hu.zedas.backend.albums;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AlbumPostRequest {
    @NotBlank(message = "ARTIST_NAME_REQUIRED")
    @Size(max = 120, message = "ARTIST_NAME_TOO_LONG")
    private String artistName;

    @NotBlank(message = "TITLE_REQUIRED")
    @Size(max = 160, message = "TITLE_TOO_LONG")
    private String title;

    private Integer artistId;

    public String getArtistName() {
        return artistName;
    }

    public void setArtistName(String artistName) {
        this.artistName = artistName == null ? null : artistName.strip();
    }

    public Integer getArtistId() {
        return artistId;
    }

    public void setArtistId(Integer artistId) {
        this.artistId = artistId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title == null ? null : title.strip();
    }
}
