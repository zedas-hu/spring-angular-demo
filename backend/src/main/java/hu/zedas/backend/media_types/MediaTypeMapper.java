package hu.zedas.backend.media_types;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.factory.Mappers;

@Mapper(
    componentModel = "spring", 
    unmappedTargetPolicy = ReportingPolicy.ERROR, 
    unmappedSourcePolicy = ReportingPolicy.ERROR
)
public interface MediaTypeMapper {
    MediaTypeMapper INSTANCE = Mappers.getMapper(MediaTypeMapper.class);

    
    MediaTypeResponse toResponse(MediaTypeEntity entity);
}
