package hu.zedas.backend.tracks;

import java.net.URI;
import java.util.Objects;
import java.util.Set;

import hu.zedas.backend.albums.AlbumEntity;
import hu.zedas.backend.albums.AlbumRepository;
import hu.zedas.backend.albums.LogicValidationException;
import hu.zedas.backend.genres.GenreRepository;
import hu.zedas.backend.media_types.MediaTypeRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PagedModel;
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
    private final TrackMapper trackMapper;

    public TrackController(
            TrackRepository tracksRepository,
            AlbumRepository albumRepository,
            GenreRepository genreRepository,
            MediaTypeRepository mediaTypeRepository,
            TrackMapper trackMapper) {
        this.tracksRepository = tracksRepository;
        this.albumRepository = albumRepository;
        this.genreRepository = genreRepository;
        this.mediaTypeRepository = mediaTypeRepository;
        this.trackMapper = trackMapper;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<TrackResponse> createTrack(@Valid @RequestBody TrackPostRequest request) {
        AlbumEntity album = albumRepository.findById(request.getAlbumId()).orElseThrow(
                () -> new LogicValidationException("albumId", "ALBUM_NOT_FOUND", HttpStatus.BAD_REQUEST));
        if (tracksRepository.existsByAlbum_AlbumIdAndNameIgnoreCase(album.getAlbumId(), request.getName())) {
            throw new LogicValidationException("name", "TRACK_NAME_DUPLICATION");
        }
        var genre = genreRepository.findById(request.getGenreId()).orElseThrow(
                () -> new LogicValidationException("genreId", "GENRE_NOT_FOUND", HttpStatus.BAD_REQUEST));
        var mediaType = mediaTypeRepository.findById(request.getMediaTypeId()).orElseThrow(
                () -> new LogicValidationException("mediaTypeId", "MEDIA_TYPE_NOT_FOUND", HttpStatus.BAD_REQUEST));

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
        return ResponseEntity.created(location).body(trackMapper.toResponse(track));
    }

    @PutMapping("/{id}")
    @Transactional
    public TrackResponse updateTrack(@PathVariable Integer id, @Valid @RequestBody TrackPostRequest request) {
        TrackEntity track = tracksRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "TRACK_NOT_FOUND"));
        AlbumEntity album = albumRepository.findById(request.getAlbumId()).orElseThrow(
                () -> new LogicValidationException("albumId", "ALBUM_NOT_FOUND", HttpStatus.BAD_REQUEST));
        boolean sameAlbumAndName = track.getAlbum() != null
                && track.getAlbum().getAlbumId().equals(album.getAlbumId())
                && Objects.equals(track.getName(), request.getName());
        // Unchanged name and album were already accepted, so existing duplicates stay editable.
        if (!sameAlbumAndName && tracksRepository.existsByAlbum_AlbumIdAndNameIgnoreCaseAndTrackIdNot(
                album.getAlbumId(), request.getName(), id)) {
            throw new LogicValidationException("name", "TRACK_NAME_DUPLICATION");
        }
        var genre = genreRepository.findById(request.getGenreId()).orElseThrow(
                () -> new LogicValidationException("genreId", "GENRE_NOT_FOUND", HttpStatus.BAD_REQUEST));
        var mediaType = mediaTypeRepository.findById(request.getMediaTypeId()).orElseThrow(
                () -> new LogicValidationException("mediaTypeId", "MEDIA_TYPE_NOT_FOUND", HttpStatus.BAD_REQUEST));

        track.setName(request.getName());
        track.setAlbum(album);
        track.setGenre(genre);
        track.setMediaType(mediaType);
        track.setComposer(request.getComposer());
        track.setMilliseconds(request.getMilliseconds());
        track.setUnitPrice(request.getUnitPrice());

        return trackMapper.toResponse(tracksRepository.save(track));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteTrack(@PathVariable Integer id) {
        if (!tracksRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        if (tracksRepository.countInvoiceItems(id) > 0) {
            throw new LogicValidationException("trackId", "TRACK_DELETE_REFERENCED");
        }

        tracksRepository.deletePlaylistReferences(id);
        tracksRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public PagedModel<TrackResponse> getAllTracks(
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
            return new PagedModel<>(tracksRepository
                    .findByNameContainingIgnoreCaseOrAlbum_TitleContainingIgnoreCaseOrAlbum_Artist_NameContainingIgnoreCase(
                            normalizedFilter, normalizedFilter, normalizedFilter, pageable)
                    .map(trackMapper::toResponse));

        return new PagedModel<>(tracksRepository.findAll(pageable).map(trackMapper::toResponse));
    }

    @GetMapping("/{id}")
    public TrackResponse getTrackById(@PathVariable Integer id) {
        return trackMapper.toResponse(tracksRepository.findDetailedByTrackId(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "TRACK_NOT_FOUND")));
    }
}
