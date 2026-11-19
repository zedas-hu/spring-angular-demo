package hu.zedas.backend.tracks;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

public interface TrackRepository extends JpaRepository<TrackEntity, Integer> {
    void deleteByAlbum_AlbumId(Integer albumId);

    boolean existsByAlbum_AlbumIdAndNameIgnoreCase(Integer albumId, String name);

    @EntityGraph(attributePaths = {"album.artist", "mediaType", "genre"})
    Page<TrackEntity> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"album.artist", "mediaType", "genre"})
    Page<TrackEntity> findByNameContainingIgnoreCaseOrAlbum_TitleContainingIgnoreCaseOrAlbum_Artist_NameContainingIgnoreCase(
            String nameFilter, String albumTitleFilter, String artistNameFilter, Pageable pageable);
}
