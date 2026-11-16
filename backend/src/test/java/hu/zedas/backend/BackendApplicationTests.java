package hu.zedas.backend;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Locale;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.boot.test.context.SpringBootTest;

import hu.zedas.backend.tracks.TrackEntity;
import hu.zedas.backend.tracks.TrackRepository;

@SpringBootTest
class BackendApplicationTests {
	@Autowired
	private TrackRepository tracksRepository;

	@Test
	void contextLoads() {
	}

	@Test
	void trackSearchMatchesNamesAlbumTitlesAndArtistNamesCaseInsensitively() {
		var firstTrackPage = tracksRepository.findAll(
				PageRequest.of(0, 1, Sort.by("trackId")));
		assertFalse(firstTrackPage.isEmpty());

		TrackEntity sampleTrack = firstTrackPage.getContent().get(0);
		String nameFilter = sampleTrack.getName().substring(0, 2).toLowerCase(Locale.ROOT);
		var nameMatches = tracksRepository
				.findByNameContainingIgnoreCaseOrAlbum_TitleContainingIgnoreCaseOrAlbum_Artist_NameContainingIgnoreCase(
						nameFilter, nameFilter, nameFilter, Pageable.unpaged());
		assertTrue(nameMatches.getContent().stream().anyMatch(track ->
				track.getName().toLowerCase(Locale.ROOT).contains(nameFilter)));

		String albumTitle = sampleTrack.getAlbum().getTitle();
		String albumFilter = albumTitle.substring(0, 2).toLowerCase(Locale.ROOT);
		var albumMatches = tracksRepository
				.findByNameContainingIgnoreCaseOrAlbum_TitleContainingIgnoreCaseOrAlbum_Artist_NameContainingIgnoreCase(
						albumFilter, albumFilter, albumFilter, Pageable.unpaged());
		assertTrue(albumMatches.getContent().stream().anyMatch(track ->
				track.getAlbum().getTitle().toLowerCase(Locale.ROOT).contains(albumFilter)));

		String artistName = sampleTrack.getAlbum().getArtist().getName();
		String artistFilter = artistName.substring(0, 2).toLowerCase(Locale.ROOT);
		var artistMatches = tracksRepository
				.findByNameContainingIgnoreCaseOrAlbum_TitleContainingIgnoreCaseOrAlbum_Artist_NameContainingIgnoreCase(
						artistFilter, artistFilter, artistFilter, Pageable.unpaged());
		assertTrue(artistMatches.getContent().stream().anyMatch(track ->
				track.getAlbum().getArtist().getName().toLowerCase(Locale.ROOT).contains(artistFilter)));
	}
}
