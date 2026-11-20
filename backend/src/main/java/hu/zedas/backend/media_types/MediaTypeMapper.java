package hu.zedas.backend.media_types;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(
    componentModel = "spring", 
    unmappedTargetPolicy = ReportingPolicy.ERROR, 
    unmappedSourcePolicy = ReportingPolicy.ERROR
)
public interface MediaTypeMapper {
    MediaTypeResponse toResponse(MediaTypeEntity entity);
}
