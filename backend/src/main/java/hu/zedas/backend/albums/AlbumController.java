package hu.zedas.backend.albums;

import java.net.URI;
import java.util.List;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;
import hu.zedas.backend.artists.ArtistEntity;
import hu.zedas.backend.artists.ArtistRepository;
import org.springframework.transaction.annotation.Transactional;
import hu.zedas.backend.KeyResponse;
import hu.zedas.backend.tracks.TrackRepository;

@RestController
@RequestMapping("/api/albums")
public class AlbumController {
    private final AlbumRepository albumRepository;
    private final ArtistRepository artistRepository;
    private final TrackRepository trackRepository;
    private final AlbumMapper albumMapper;

    public AlbumController(
            AlbumRepository albumRepository,
            ArtistRepository artistRepository,
            TrackRepository trackRepository,
            AlbumMapper albumMapper) {
        this.albumRepository = albumRepository;
        this.artistRepository = artistRepository;
        this.trackRepository = trackRepository;
        this.albumMapper = albumMapper;
    }

    @GetMapping
    public List<AlbumResponse> getAllAlbums() {
        return albumRepository.findAll().stream().map(albumMapper::toResponse).toList();
    }

    @GetMapping("/keys")
    public List<KeyResponse> getAllAlbumKeys() {
        return albumRepository.findAll().stream()
                .map(album -> new KeyResponse(album.getAlbumId(), album.getTitle()))
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlbumResponse> getAlbumById(@PathVariable Integer id) {
        return ResponseEntity.of(
                albumRepository.findById(id).map(albumMapper::toResponse));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteAlbum(@PathVariable Integer id) {
        if (!albumRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        if (trackRepository.countInvoiceItemsByAlbumId(id) > 0) {
            throw new LogicValidationException("albumId", "ALBUM_DELETE_REFERENCED");
        }

        trackRepository.deletePlaylistReferencesByAlbumId(id);
        trackRepository.deleteByAlbum_AlbumId(id);
        albumRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    @Transactional
    public ResponseEntity<AlbumResponse> createAlbum(@Valid @RequestBody AlbumPostRequest request) {
        if (albumRepository.findByTitle(request.getTitle()).isPresent())
            throw new LogicValidationException("title", "TITLE_DUPLICATION");
        ArtistEntity artist = request.getArtistId() == null
                ? artistRepository.save(new ArtistEntity(request.getArtistName()))
                : artistRepository.findById(request.getArtistId()).orElseThrow(
                        () -> new LogicValidationException("artistId", "ARTIST_NOT_FOUND", HttpStatus.BAD_REQUEST));
        AlbumEntity album = new AlbumEntity(request.getTitle(), artist);
        album = albumRepository.save(album);
        URI location = URI.create("/api/albums/" + album.getAlbumId());

        return ResponseEntity.created(location)
                .body(albumMapper.toResponse(album));
    }
    
}
