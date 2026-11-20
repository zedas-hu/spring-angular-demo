package hu.zedas.backend.login;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.ERROR,
        unmappedSourcePolicy = ReportingPolicy.ERROR)
public interface CurrentUserMapper {
    CurrentUserResponse toResponse(CurrentUser currentUser);
}
