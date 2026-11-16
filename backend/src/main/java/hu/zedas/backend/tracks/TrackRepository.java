package hu.zedas.backend.tracks;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

public interface TrackRepository extends JpaRepository<TrackEntity, Integer> {
    @EntityGraph(attributePaths = {"album.artist", "mediaType", "genre"})
    Page<TrackEntity> findAll(Pageable pageable);
}
