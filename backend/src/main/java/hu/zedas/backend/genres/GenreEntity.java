package hu.zedas.backend.genres;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
// CREATE TABLE "genres"
// (
//     [GenreId] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
//     [Name] NVARCHAR(120)
// )

@Entity(name = "genres")
public class GenreEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column (name = "GenreId")
    private Integer genreId;

    @Column(name = "Name")
    private String name;

    protected GenreEntity() {
    }

    public Integer getGenreId() {
        return genreId;
    }

    public void setGenreId(Integer genreId) {
        this.genreId = genreId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
