package hu.zedas.backend.albums;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

// CREATE TABLE "albums"
// (
//     [AlbumId] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
//     [Title] NVARCHAR(160)  NOT NULL,
//     [ArtistId] INTEGER  NOT NULL,
//     FOREIGN KEY ([ArtistId]) REFERENCES "artists" ([ArtistId]) 
// 		ON DELETE NO ACTION ON UPDATE NO ACTION
// )

@Entity (name = "albums")
public class AlbumEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column (name = "AlbumId")
    private Integer albumId;

    @Column (name = "Title", nullable = false, length = 160)
    private String title;

    @Column (name = "ArtistId", nullable = false)
    private Integer artistId;

    protected AlbumEntity() {
    }

    public Integer getAlbumId() {
        return albumId;
    }

    public void setAlbumId(Integer albumId) {
        this.albumId = albumId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }       

    public Integer getArtistId() {
        return artistId;
    }

    public void setArtistId(Integer artistId) {
        this.artistId = artistId;
    }
}
