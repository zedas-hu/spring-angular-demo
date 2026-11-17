package hu.zedas.backend.albums;

import java.net.URI;
import java.util.List;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;
import hu.zedas.backend.artists.ArtistEntity;
import hu.zedas.backend.artists.ArtistRepository;


@RestController
@RequestMapping("/api/albums")
public class AlbumController {
    private final AlbumRepository albumRepository;
    private final ArtistRepository artistRepository;

    public AlbumController(AlbumRepository albumRepository, ArtistRepository artistRepository) {
        this.albumRepository = albumRepository;
        this.artistRepository = artistRepository;
    }

    @GetMapping
    public List<AlbumResponse> getAllAlbums() {
        return albumRepository.findAll().stream().map(AlbumMapper.INSTANCE::toResponse).toList();
    }

    @GetMapping("/{id}")
    public AlbumResponse getAlbumById(@PathVariable Integer id) {
        return AlbumMapper.INSTANCE.toResponse(albumRepository.findById(id).orElseThrow(
            () -> new IllegalArgumentException("Album not found")));
    }

    @PostMapping
    public ResponseEntity<AlbumResponse> createAlbum(@Valid @RequestBody AlbumPostRequest request) {
        AlbumEntity entity = AlbumMapper.INSTANCE.toEntity(request);
        ArtistEntity artist = artistRepository.findById(request.getArtistId()).orElseThrow(
            () -> new IllegalArgumentException("Artist not found"));
        if (this.albumRepository.findByTitle(request.getTitle()).isPresent())
            throw new IllegalArgumentException("Album with the same title already exists");
        entity.setArtist(artist);
        entity = albumRepository.save(entity);
        URI location = URI.create("/api/albums/" + entity.getAlbumId());

        return ResponseEntity.created(location)
                .body(AlbumMapper.INSTANCE.toResponse(entity));
    }
    
}
