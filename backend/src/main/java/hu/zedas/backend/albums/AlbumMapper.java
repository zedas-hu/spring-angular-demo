package hu.zedas.backend.albums;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.factory.Mappers;

import hu.zedas.backend.tracks.TrackEntity;
import hu.zedas.backend.tracks.TrackResponse;
import hu.zedas.backend.tracks.TrackMapper;

@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.ERROR,
    unmappedSourcePolicy = ReportingPolicy.ERROR
)
public interface AlbumMapper {
    AlbumMapper INSTANCE = Mappers.getMapper(AlbumMapper.class);

    @Mapping(target = "artistId", source = "artist.artistId")
    @Mapping(target = "artistName", source = "artist.name")
    @Mapping(target = "tracks", source = "tracks")
    AlbumResponse toResponse(AlbumEntity entity);

    default TrackResponse toTrackResponse(TrackEntity entity) {
        return TrackMapper.INSTANCE.toResponse(entity);
    }
}
