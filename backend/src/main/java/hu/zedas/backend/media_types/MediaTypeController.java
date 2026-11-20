package hu.zedas.backend.media_types;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/media-types")
public class MediaTypeController {
    private final MediaTypeRepository mediaTypeRepository;
    private final MediaTypeMapper mediaTypeMapper;

    public MediaTypeController(MediaTypeRepository mediaTypeRepository, MediaTypeMapper mediaTypeMapper) {
        this.mediaTypeRepository = mediaTypeRepository;
        this.mediaTypeMapper = mediaTypeMapper;
    }

    @GetMapping
    public List<MediaTypeResponse> getAllMediaTypes() {
        return mediaTypeRepository.findAll().stream().map(mediaTypeMapper::toResponse).toList();
    }

    @GetMapping("/{id}")
    public MediaTypeResponse getMediaTypeById(@PathVariable Integer id) {
        return mediaTypeMapper.toResponse(mediaTypeRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "MEDIA_TYPE_NOT_FOUND")));
    }
}
