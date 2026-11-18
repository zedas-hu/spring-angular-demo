package hu.zedas.backend.artists;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

// CREATE TABLE "artists"
// (
// [ArtistId] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
// [Name] NVARCHAR(120)
// )

@Entity(name = "artists")
public class ArtistEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ArtistId")
    private Integer artistId;

    @Column(name = "Name", length = 120)
    private String name;

    protected ArtistEntity() {
    }

    public ArtistEntity(String name) {
        this.name = name;
    }

    public Integer getArtistId() {
        return artistId;
    }

    public void setArtistId(Integer artistId) {
        this.artistId = artistId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
