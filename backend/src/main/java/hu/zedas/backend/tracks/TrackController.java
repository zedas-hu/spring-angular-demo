package hu.zedas.backend.tracks;

import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/tracks")
public class TrackController {
    private static final Set<String> ALLOWED_SORT_PROPERTIES = Set.of(
            "name", "composer", "milliseconds", "unitPrice", "albumTitle", "genreName", "mediaTypeName", "albumArtistName");

    private final TrackRepository tracksRepository;

    public TrackController(TrackRepository tracksRepository) {
        this.tracksRepository = tracksRepository;
    }

    @GetMapping
    public Page<TrackResponse> getAllTracks(
            @RequestParam(required = false) String filter,
            @PageableDefault(size = 20, sort = { "name" }, direction = Sort.Direction.ASC) Pageable pageable) {
        if (pageable.getSort().stream().anyMatch(order -> {
            String property = order.getProperty();
            return property == null || !ALLOWED_SORT_PROPERTIES.contains(property);
        }))
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Unsupported sort property");

        String normalizedFilter = filter == null ? null : filter.strip();
        if (normalizedFilter != null && normalizedFilter.length() >= 2)
            return tracksRepository
                    .findByNameContainingIgnoreCaseOrAlbum_TitleContainingIgnoreCaseOrAlbum_Artist_NameContainingIgnoreCase(
                            normalizedFilter, normalizedFilter, normalizedFilter, pageable)
                    .map(TrackMapper.INSTANCE::toResponse);

        return tracksRepository.findAll(pageable).map(TrackMapper.INSTANCE::toResponse);
    }

    @GetMapping("/{id}")
    public TrackResponse getTrackById(@PathVariable Integer id) {
        return TrackMapper.INSTANCE.toResponse(tracksRepository.findById(id).orElseThrow());
    }
}
