package hu.zedas.backend.albums;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlbumRepository extends JpaRepository<AlbumEntity, Integer> {
    public AlbumEntity getById(Integer albumId);
    List<AlbumEntity> findAllByOrderByTitleAsc();
}
