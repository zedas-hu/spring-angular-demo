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
    TrackResponse toResponse(TrackEntity entity);
}
