package hu.zedas.backend.media_types;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

// CREATE TABLE "media_types"
// (
//     [MediaTypeId] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
//     [Name] NVARCHAR(120)
// )

@Entity(name = "media_types")
public class MediaTypeEntity {
    @Id
    @Column(name = "MediaTypeId", nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer mediaTypeId;

    @Column(name = "Name", length = 120)
    private String name;

    protected MediaTypeEntity() {}

    public Integer getMediaTypeId() {
        return mediaTypeId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
