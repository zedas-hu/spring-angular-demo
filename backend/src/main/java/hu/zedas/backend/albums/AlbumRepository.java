package hu.zedas.backend.albums;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AlbumRepository extends JpaRepository<AlbumEntity, Integer> {
    @Override
    @EntityGraph(attributePaths = {"artist", "tracks", "tracks.genre", "tracks.mediaType"})
    List<AlbumEntity> findAll();

    @Query("select a.albumId as albumId, a.title as title from albums a")
    List<AlbumKeyProjection> findAllKeyProjections();

    @Override
    @EntityGraph(attributePaths = {"artist", "tracks", "tracks.genre", "tracks.mediaType"})
    Optional<AlbumEntity> findById(Integer albumId);

    List<AlbumEntity> findAllByOrderByTitleAsc();

    Optional<AlbumEntity> findByTitle(String title);
}
