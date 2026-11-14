package hu.zedas.backend.albums;

import java.util.List;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/albums")
public class AlbumController {
    private final AlbumRepository albumRepository;

    public AlbumController(AlbumRepository albumRepository) {
        this.albumRepository = albumRepository;
    }

    @GetMapping
    public List<AlbumResponse> getAllAlbums() {
        return albumRepository.findAll().stream().map(AlbumMapper.INSTANCE::toResponse).toList();
    }

    @GetMapping("/{id}")
    public AlbumResponse getAlbumById(@PathVariable Integer id) {
        return AlbumMapper.INSTANCE.toResponse(albumRepository.findById(id).orElseThrow());
    }
}
