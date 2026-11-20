package hu.zedas.backend.tracks;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TrackRepository extends JpaRepository<TrackEntity, Integer> {
    void deleteByAlbum_AlbumId(Integer albumId);

    boolean existsByAlbum_AlbumIdAndNameIgnoreCase(Integer albumId, String name);

    boolean existsByAlbum_AlbumIdAndNameIgnoreCaseAndTrackIdNot(Integer albumId, String name, Integer trackId);

    @EntityGraph(attributePaths = {"album.artist", "mediaType", "genre"})
    Page<TrackEntity> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"album.artist", "mediaType", "genre"})
    Page<TrackEntity> findByNameContainingIgnoreCaseOrAlbum_TitleContainingIgnoreCaseOrAlbum_Artist_NameContainingIgnoreCase(
            String nameFilter, String albumTitleFilter, String artistNameFilter, Pageable pageable);

    @EntityGraph(attributePaths = {"album.artist", "mediaType", "genre"})
    Optional<TrackEntity> findDetailedByTrackId(Integer trackId);

// ──────────────────────────────────────────────────────────────────────────────
// Invoice item and playlist track related queries
// These tables do not have own Entity classes, so we use native queries to interact with them.
// ──────────────────────────────────────────────────────────────────────────────

    @Query(value = "SELECT COUNT(*) FROM invoice_items WHERE TrackId = :trackId", nativeQuery = true)
    long countInvoiceItems(@Param("trackId") Integer trackId);

    @Query(value = """
            SELECT COUNT(*)
            FROM invoice_items i
            JOIN tracks t ON t.TrackId = i.TrackId
            WHERE t.AlbumId = :albumId
            """, nativeQuery = true)
    long countInvoiceItemsByAlbumId(@Param("albumId") Integer albumId);

    @Modifying
    @Query(value = "DELETE FROM playlist_track WHERE TrackId = :trackId", nativeQuery = true)
    int deletePlaylistReferences(@Param("trackId") Integer trackId);

    @Modifying
    @Query(value = """
            DELETE FROM playlist_track
            WHERE TrackId IN (SELECT TrackId FROM tracks WHERE AlbumId = :albumId)
            """, nativeQuery = true)
    int deletePlaylistReferencesByAlbumId(@Param("albumId") Integer albumId);

    @Query(value = "SELECT COUNT(*) FROM playlist_track WHERE TrackId = :trackId", nativeQuery = true)
    long countPlaylistReferences(@Param("trackId") Integer trackId);

}
