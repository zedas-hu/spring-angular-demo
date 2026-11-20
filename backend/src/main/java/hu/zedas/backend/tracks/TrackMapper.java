package hu.zedas.backend.tracks;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(
    componentModel = "spring", 
    unmappedTargetPolicy = ReportingPolicy.ERROR, 
    unmappedSourcePolicy = ReportingPolicy.ERROR
)
public interface TrackMapper {
    @Mapping(target = "albumId", source = "album.albumId")
    @Mapping(target = "albumTitle", source = "album.title")
    @Mapping(target = "artistName", source = "album.artist.name")
    @Mapping(target = "genreId", source = "genre.genreId")
    @Mapping(target = "genreName", source = "genre.name")
    @Mapping(target = "mediaTypeId", source = "mediaType.mediaTypeId")
    @Mapping(target = "mediaTypeName", source = "mediaType.name")
    TrackResponse toResponse(TrackEntity entity);
}
