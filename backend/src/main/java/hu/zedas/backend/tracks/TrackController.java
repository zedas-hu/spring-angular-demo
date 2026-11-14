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
    // private static final Set<String> ALLOWED_SORT_PROPERTIES = Set.of(
    //         "name", "composer", "milliseconds", "unitPrice", "albumTitle", "genreName", "mediaTypeName");

    private final TrackRepository tracksRepository;

    public TrackController(TrackRepository tracksRepository) {
        this.tracksRepository = tracksRepository;
    }

    @GetMapping
    public Page<TrackResponse> getAllTracks(
            @PageableDefault(size = 20, sort = {"name"}, direction = Sort.Direction.ASC)
            Pageable pageable) {
        // return tracksRepository.findAll(validateAndStabilizeSort(pageable))
        //         .map(TrackMapper.INSTANCE::toResponse);
        return tracksRepository.findAll(pageable).map(TrackMapper.INSTANCE::toResponse);
    }

    @GetMapping("/{id}")
    public TrackResponse getTrackById(@PathVariable Integer id) {
        return TrackMapper.INSTANCE.toResponse(tracksRepository.findById(id).orElseThrow());
    }

    // static Pageable validateAndStabilizeSort(Pageable pageable) {
    //     Sort sort = pageable.getSort();
    //     for (Sort.Order order : sort) {
    //         if (!ALLOWED_SORT_PROPERTIES.contains(order.getProperty())) {
    //             throw new ResponseStatusException(
    //                     HttpStatus.BAD_REQUEST,
    //                     "Unsupported sort property: " + order.getProperty());
    //         }
    //     }

    //     if (sort.isSorted() && sort.getOrderFor("name") == null) {
    //         sort = sort.and(Sort.by(Sort.Direction.ASC, "name"));
    //     }

    //     return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
    // }
}
