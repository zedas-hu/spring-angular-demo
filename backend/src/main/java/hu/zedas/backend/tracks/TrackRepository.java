package hu.zedas.backend.tracks;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;

public interface TrackRepository extends JpaRepository<TrackEntity, Integer> {
    @EntityGraph(attributePaths = "album")
    List<TrackEntity> findAllByOrderByNameAsc();
}
