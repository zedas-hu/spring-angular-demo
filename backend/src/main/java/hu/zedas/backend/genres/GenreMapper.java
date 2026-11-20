package hu.zedas.backend.genres;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.ERROR,
    unmappedSourcePolicy = ReportingPolicy.ERROR
)
public interface GenreMapper {
    GenreResponse toResponse(GenreEntity entity);
}
