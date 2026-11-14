package hu.zedas.backend.tracks;

import java.math.BigDecimal;

import hu.zedas.backend.albums.AlbumEntity;
import hu.zedas.backend.genres.GenreEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

// CREATE TABLE "tracks"
// (
//     [TrackId] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
//     [Name] NVARCHAR(200)  NOT NULL,
//     [AlbumId] INTEGER,
//     [MediaTypeId] INTEGER  NOT NULL,
//     [GenreId] INTEGER,
//     [Composer] NVARCHAR(220),
//     [Milliseconds] INTEGER  NOT NULL,
//     [Bytes] INTEGER,
//     [UnitPrice] NUMERIC(10,2)  NOT NULL,
//     FOREIGN KEY ([AlbumId]) REFERENCES "albums" ([AlbumId]) 
// 		ON DELETE NO ACTION ON UPDATE NO ACTION,
//     FOREIGN KEY ([GenreId]) REFERENCES "genres" ([GenreId]) 
// 		ON DELETE NO ACTION ON UPDATE NO ACTION,
//     FOREIGN KEY ([MediaTypeId]) REFERENCES "media_types" ([MediaTypeId]) 
// 		ON DELETE NO ACTION ON UPDATE NO ACTION
// )

@Entity(name = "tracks")
public class TrackEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column (name = "TrackId", nullable = false)
    private Integer trackId;

    @Column(name = "Name", length = 200, nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "AlbumId")
    private AlbumEntity album;

    // @Column(name = "AlbumId")
    // private Integer albumId;

    @Column(name = "MediaTypeId", nullable = false)
    private Integer mediaTypeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "GenreId")
    private GenreEntity genre;

    // @Column(name = "GenreId")
    // private Integer genreId;

    @Column(name = "Composer", length = 220)
    private String composer;

    @Column(name = "Milliseconds", nullable = false)
    private Integer milliseconds;

    @Column(name = "Bytes")
    private Integer bytes;

    @Column(name = "UnitPrice", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    protected TrackEntity() {}

    public Integer getTrackId() {
        return trackId;
    }
    
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // public Integer getAlbumId() {
    //     return albumId;
    // }

    // public void setAlbumId(Integer albumId) {
    //     this.albumId = albumId;
    // }

    public AlbumEntity getAlbum() {
        return album;
    }

    public void setAlbum(AlbumEntity album) {
        this.album = album;
    }

    public Integer getMediaTypeId() {
        return mediaTypeId;
    }

    public void setMediaTypeId(Integer mediaTypeId) {
        this.mediaTypeId = mediaTypeId;
    }

    // public Integer getGenreId() {
    //     return genreId;
    // }

    // public void setGenreId(Integer genreId) {
    //     this.genreId = genreId;
    // }

    public String getComposer() {
        return composer;
    }

    public void setComposer(String composer) {
        this.composer = composer;
    }

    public Integer getMilliseconds() {
        return milliseconds;
    }

    public void setMilliseconds(Integer milliseconds) {
        this.milliseconds = milliseconds;
    }

    public Integer getBytes() {
        return bytes;
    }

    public void setBytes(Integer bytes) {
        this.bytes = bytes;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }
}
