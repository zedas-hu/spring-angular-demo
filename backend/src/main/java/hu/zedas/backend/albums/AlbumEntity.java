package hu.zedas.backend.albums;

import java.util.ArrayList;
import java.util.List;

import hu.zedas.backend.artists.ArtistEntity;
import hu.zedas.backend.tracks.TrackEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;

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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ArtistId", nullable = false)
    private ArtistEntity artist;

    @OneToMany(mappedBy = "album", fetch = FetchType.LAZY)
    @OrderBy("trackId ASC")
    private List<TrackEntity> tracks = new ArrayList<>();

    protected AlbumEntity() {
    }

    public AlbumEntity(String title, ArtistEntity artist) {
        this.title = title;
        this.artist = artist;
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

    public ArtistEntity getArtist() {
        return artist;
    }

    public void setArtist(ArtistEntity artist) {
        this.artist = artist;
    }

    public List<TrackEntity> getTracks() {
        return tracks;
    }
}
