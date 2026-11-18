package hu.zedas.backend.artists;

import java.util.List;

import hu.zedas.backend.KeyResponse;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/artists")
public class ArtistController {
    private final ArtistRepository artistRepository;

    public ArtistController(ArtistRepository artistRepository) {
        this.artistRepository = artistRepository;
    }

    @GetMapping("/keys")
    public List<KeyResponse> getAllArtistKeys() {
        return artistRepository.findAll().stream()
                .map(artist -> new KeyResponse(artist.getArtistId(), artist.getName()))
                .toList();
    }
}
