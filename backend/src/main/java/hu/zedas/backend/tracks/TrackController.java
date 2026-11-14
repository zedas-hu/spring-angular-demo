package hu.zedas.backend.tracks;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/tracks")
public class TrackController {
    private final TrackRepository tracksRepository;

    public TrackController(TrackRepository tracksRepository) {
        this.tracksRepository = tracksRepository;
    }

    @GetMapping
    public Page<TrackResponse> getAllTracks(
            @PageableDefault(size = 20, sort = {"name", "trackId"}, direction = Sort.Direction.ASC)
            Pageable pageable) {
        return tracksRepository.findAll(pageable).map(TrackMapper.INSTANCE::toResponse);
    }

    @GetMapping("/{id}")
    public TrackResponse getTrackById(@PathVariable Integer id) {
        return TrackMapper.INSTANCE.toResponse(tracksRepository.findById(id).orElseThrow());
    }
}
