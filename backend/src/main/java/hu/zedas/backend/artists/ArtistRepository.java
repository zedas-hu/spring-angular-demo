package hu.zedas.backend.artists;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ArtistRepository extends JpaRepository<ArtistEntity, Integer> {
    Optional<ArtistEntity> findFirstByName(String name);
}
