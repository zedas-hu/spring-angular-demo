package hu.zedas.backend.tracks;

import java.net.URI;
import java.util.Set;

import hu.zedas.backend.albums.AlbumEntity;
import hu.zedas.backend.albums.AlbumRepository;
import hu.zedas.backend.albums.BusinessValidationException;
import hu.zedas.backend.genres.GenreRepository;
import hu.zedas.backend.media_types.MediaTypeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tracks")
public class TrackController {
    private static final Set<String> ALLOWED_SORT_PROPERTIES = Set.of(
            "name", "composer", "milliseconds", "unitPrice", "albumTitle", "genreName", "mediaTypeName", "albumArtistName");

    private final TrackRepository tracksRepository;
    private final AlbumRepository albumRepository;
    private final GenreRepository genreRepository;
    private final MediaTypeRepository mediaTypeRepository;

    public TrackController(
            TrackRepository tracksRepository,
            AlbumRepository albumRepository,
            GenreRepository genreRepository,
            MediaTypeRepository mediaTypeRepository) {
        this.tracksRepository = tracksRepository;
        this.albumRepository = albumRepository;
        this.genreRepository = genreRepository;
        this.mediaTypeRepository = mediaTypeRepository;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<TrackResponse> createTrack(@Valid @RequestBody TrackPostRequest request) {
        AlbumEntity album = albumRepository.findById(request.getAlbumId()).orElseThrow(
                () -> new BusinessValidationException("albumId", "ALBUM_NOT_FOUND", HttpStatus.BAD_REQUEST));
        if (tracksRepository.existsByAlbum_AlbumIdAndNameIgnoreCase(album.getAlbumId(), request.getName())) {
            throw new BusinessValidationException("name", "TRACK_NAME_DUPLICATION");
        }
        var genre = genreRepository.findById(request.getGenreId()).orElseThrow(
                () -> new BusinessValidationException("genreId", "GENRE_NOT_FOUND", HttpStatus.BAD_REQUEST));
        var mediaType = mediaTypeRepository.findById(request.getMediaTypeId()).orElseThrow(
                () -> new BusinessValidationException("mediaTypeId", "MEDIA_TYPE_NOT_FOUND", HttpStatus.BAD_REQUEST));

        TrackEntity track = new TrackEntity();
        track.setName(request.getName());
        track.setAlbum(album);
        track.setGenre(genre);
        track.setMediaType(mediaType);
        track.setComposer(request.getComposer());
        track.setMilliseconds(request.getMilliseconds());
        track.setUnitPrice(request.getUnitPrice());

        track = tracksRepository.save(track);
        URI location = URI.create("/api/tracks/" + track.getTrackId());
        return ResponseEntity.created(location).body(TrackMapper.INSTANCE.toResponse(track));
    }

    @PutMapping("/{id}")
    @Transactional
    public TrackResponse updateTrack(@PathVariable Integer id, @Valid @RequestBody TrackPostRequest request) {
        TrackEntity track = tracksRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "TRACK_NOT_FOUND"));
        AlbumEntity album = albumRepository.findById(request.getAlbumId()).orElseThrow(
                () -> new BusinessValidationException("albumId", "ALBUM_NOT_FOUND", HttpStatus.BAD_REQUEST));
        if (tracksRepository.existsByAlbum_AlbumIdAndNameIgnoreCaseAndTrackIdNot(
                album.getAlbumId(), request.getName(), id)) {
            throw new BusinessValidationException("name", "TRACK_NAME_DUPLICATION");
        }
        var genre = genreRepository.findById(request.getGenreId()).orElseThrow(
                () -> new BusinessValidationException("genreId", "GENRE_NOT_FOUND", HttpStatus.BAD_REQUEST));
        var mediaType = mediaTypeRepository.findById(request.getMediaTypeId()).orElseThrow(
                () -> new BusinessValidationException("mediaTypeId", "MEDIA_TYPE_NOT_FOUND", HttpStatus.BAD_REQUEST));

        track.setName(request.getName());
        track.setAlbum(album);
        track.setGenre(genre);
        track.setMediaType(mediaType);
        track.setComposer(request.getComposer());
        track.setMilliseconds(request.getMilliseconds());
        track.setUnitPrice(request.getUnitPrice());

        return TrackMapper.INSTANCE.toResponse(tracksRepository.save(track));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteTrack(@PathVariable Integer id) {
        if (!tracksRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        if (tracksRepository.countInvoiceItems(id) > 0) {
            throw new BusinessValidationException("trackId", "TRACK_DELETE_REFERENCED");
        }

        tracksRepository.deletePlaylistReferences(id);
        tracksRepository.deleteById(id);
        return ResponseEntity.noContent().build();
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
