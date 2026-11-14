package hu.zedas.backend.genres;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GenreRepository extends JpaRepository<GenreEntity, Integer> {
    public GenreEntity getById(Integer genreId);
    List<GenreEntity> findAllByOrderByNameAsc();
}
