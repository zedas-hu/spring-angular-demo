package hu.zedas.backend.tracks;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.factory.Mappers;

@Mapper(
    componentModel = "spring", 
    unmappedTargetPolicy = ReportingPolicy.ERROR, 
    unmappedSourcePolicy = ReportingPolicy.ERROR
)
public interface TrackMapper {
    TrackMapper INSTANCE = Mappers.getMapper(TrackMapper.class);

    @Mapping(target = "albumId", source = "album.albumId")
    @Mapping(target = "albumTitle", source = "album.title")
    @Mapping(target = "artistName", source = "album.artist.name")
    @Mapping(target = "genreId", source = "genre.genreId")
    @Mapping(target = "genreName", source = "genre.name")
    @Mapping(target = "mediaTypeId", source = "mediaType.mediaTypeId")
    @Mapping(target = "mediaTypeName", source = "mediaType.name")
    TrackResponse toResponse(TrackEntity entity);
}
