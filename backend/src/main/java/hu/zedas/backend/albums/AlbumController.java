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

    public AlbumController(AlbumRepository albumRepository, ArtistRepository artistRepository, TrackRepository trackRepository) {
        this.albumRepository = albumRepository;
        this.artistRepository = artistRepository;
        this.trackRepository = trackRepository;
    }

    @GetMapping
    public List<AlbumResponse> getAllAlbums() {
        return albumRepository.findAll().stream().map(AlbumMapper.INSTANCE::toResponse).toList();
    }

    @GetMapping("/keys")
    public List<KeyResponse> getAllAlbumKeys() {
        return albumRepository.findAll().stream()
                .map(album -> new KeyResponse(album.getAlbumId(), album.getTitle()))
                .toList();
    }

    @GetMapping("/{id}")
    public AlbumResponse getAlbumById(@PathVariable Integer id) {
        return AlbumMapper.INSTANCE.toResponse(albumRepository.findById(id).orElseThrow(
            () -> new IllegalArgumentException("Album not found")));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteAlbum(@PathVariable Integer id) {
        if (!albumRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        trackRepository.deleteByAlbum_AlbumId(id);
        albumRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    @Transactional
    public ResponseEntity<AlbumResponse> createAlbum(@Valid @RequestBody AlbumPostRequest request) {
        if (albumRepository.findByTitle(request.getTitle()).isPresent())
            throw new BusinessValidationException("title", "TITLE_DUPLICATION");
        ArtistEntity artist = request.getArtistId() == null
                ? artistRepository.save(new ArtistEntity(request.getArtistName()))
                : artistRepository.findById(request.getArtistId()).orElseThrow(
                        () -> new BusinessValidationException("artistId", "ARTIST_NOT_FOUND", HttpStatus.BAD_REQUEST));
        AlbumEntity album = new AlbumEntity(request.getTitle(), artist);
        // AlbumEntity entity = AlbumMapper.INSTANCE.toEntity(request);
        // entity.setArtist(artist);
        album = albumRepository.save(album);
        URI location = URI.create("/api/albums/" + album.getAlbumId());

        return ResponseEntity.created(location)
                .body(AlbumMapper.INSTANCE.toResponse(album));
    }
    
}
