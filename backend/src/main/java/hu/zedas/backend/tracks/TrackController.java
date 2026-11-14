package hu.zedas.backend.tracks;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@RestController
@RequestMapping("/api/tracks")
public class TrackController {
    private final TrackRepository tracksRepository;

    public TrackController(TrackRepository tracksRepository) {
        this.tracksRepository = tracksRepository;
    }

    @GetMapping
    public List<TrackResponse> getAllTracks() {
        return tracksRepository.findAllByOrderByNameAsc().stream()
                .map(TrackMapper.INSTANCE::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public TrackResponse getTrackById(@PathVariable Integer id) {
        return TrackMapper.INSTANCE.toResponse(tracksRepository.findById(id).orElseThrow());
    }
}
