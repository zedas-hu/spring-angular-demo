package hu.zedas.backend.albums;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlbumRepository extends JpaRepository<AlbumEntity, Integer> {
    @Override
    @EntityGraph(attributePaths = {"artist", "tracks", "tracks.genre", "tracks.mediaType"})
    List<AlbumEntity> findAll();

    @Override
    @EntityGraph(attributePaths = {"artist", "tracks", "tracks.genre", "tracks.mediaType"})
    Optional<AlbumEntity> findById(Integer albumId);

    List<AlbumEntity> findAllByOrderByTitleAsc();
}
