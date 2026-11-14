package hu.zedas.backend.media_types;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MediaTypeRepository extends JpaRepository<MediaTypeEntity, Integer> {
    public MediaTypeEntity getById(Integer mediaTypeId);
    List<MediaTypeEntity> findAllByOrderByNameAsc();
}
