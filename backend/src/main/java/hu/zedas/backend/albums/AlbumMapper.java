package hu.zedas.backend.albums;

import org.mapstruct.InjectionStrategy;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import hu.zedas.backend.tracks.TrackMapper;

@Mapper(
    componentModel = "spring",
    uses = TrackMapper.class,
    injectionStrategy = InjectionStrategy.CONSTRUCTOR,
    unmappedTargetPolicy = ReportingPolicy.ERROR,
    unmappedSourcePolicy = ReportingPolicy.ERROR
)
public interface AlbumMapper {
    @Mapping(target = "artistId", source = "artist.artistId")
    @Mapping(target = "artistName", source = "artist.name")
    @Mapping(target = "tracks", source = "tracks")
    AlbumResponse toResponse(AlbumEntity entity);

    // @BeanMapping(ignoreUnmappedSourceProperties = "artistName")
    // @Mapping(target = "albumId", ignore = true)
    // @Mapping(target = "artist", ignore = true)
    // @Mapping(target = "tracks", ignore = true)
    // AlbumEntity toEntity(AlbumPostRequest request);
}
