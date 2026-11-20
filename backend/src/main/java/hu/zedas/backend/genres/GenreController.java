package hu.zedas.backend.genres;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/genres")
public class GenreController {
    private final GenreRepository genreRepository;
    private final GenreMapper genreMapper;

    public GenreController(GenreRepository genreRepository, GenreMapper genreMapper) {
        this.genreRepository = genreRepository;
        this.genreMapper = genreMapper;
    }

    @GetMapping
    public List<GenreResponse> getAllGenres() {
        return genreRepository.findAll().stream().map(genreMapper::toResponse).toList();
    }

    @GetMapping("/{id}")
    public GenreResponse getGenreById(@PathVariable Integer id) {
        return genreMapper.toResponse(genreRepository.findById(id).orElseThrow());
    }
}
