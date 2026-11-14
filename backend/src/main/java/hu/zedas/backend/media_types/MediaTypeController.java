package hu.zedas.backend.media_types;

import java.util.List;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/media-types")
public class MediaTypeController {
    private final MediaTypeRepository mediaTypeRepository;

    public MediaTypeController(MediaTypeRepository mediaTypeRepository) {
        this.mediaTypeRepository = mediaTypeRepository;
    }

    @GetMapping
    public List<MediaTypeResponse> getAllMediaTypes() {
        return mediaTypeRepository.findAll().stream().map(MediaTypeMapper.INSTANCE::toResponse).toList();
    }

    @GetMapping("/{id}")
    public MediaTypeResponse getMediaTypeById(@PathVariable Integer id) {
        return MediaTypeMapper.INSTANCE.toResponse(mediaTypeRepository.findById(id).orElseThrow());
    }
}
