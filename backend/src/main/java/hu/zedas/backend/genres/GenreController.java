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

    public GenreController(GenreRepository genreRepository) {
        this.genreRepository = genreRepository;
    }

    @GetMapping
    public List<GenreResponse> getAllGenres() {
        return genreRepository.findAll().stream().map(GenreMapper.INSTANCE::toResponse).toList();
    }

    @GetMapping("/{id}")
    public GenreResponse getGenreById(@PathVariable Integer id) {
        return GenreMapper.INSTANCE.toResponse(genreRepository.findById(id).orElseThrow());
    }
}
