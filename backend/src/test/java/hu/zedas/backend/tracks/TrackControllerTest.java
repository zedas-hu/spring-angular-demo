package hu.zedas.backend.tracks;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class TrackControllerTest {
    @Test
    void addsTrackIdAsStableTieBreaker() {
        Pageable pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "name"));

        Pageable result = pageable;

        assertEquals(Sort.Direction.DESC, result.getSort().getOrderFor("name").getDirection());
        assertEquals(Sort.Direction.ASC, result.getSort().getOrderFor("trackId").getDirection());
    }
}
