import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AlbumService } from '../album/album.service';

describe('Album', () => {
  let service: AlbumService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AlbumService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('sends a DELETE request for the album', async () => {
    const result = service.deleteAlbum(42);

    http.expectOne({ method: 'DELETE', url: '/api/albums/42' }).flush(null, { status: 204, statusText: 'No Content' });

    await expect(result).resolves.toBeNull();
  });

  it('reports a failed delete request', async () => {
    const result = service.deleteAlbum(42);

    http.expectOne('/api/albums/42').flush({}, { status: 500, statusText: 'Server Error' });

    await expect(result).rejects.toThrow('ALBUM_DELETE_FAILED');
  });

  it('preserves the backend error code when deleting an album fails', async () => {
    const result = service.deleteAlbum(42);

    http.expectOne('/api/albums/42').flush({ detail: 'ALBUM_DELETE_REFERENCED' }, { status: 409, statusText: 'Conflict' });

    await expect(result).rejects.toThrow('ALBUM_DELETE_REFERENCED');
  });

  it('does not show the previous album when loading another album fails', async () => {
    service.setCurrentAlbum(1);
    TestBed.tick();
    http.expectOne('/api/albums/1').flush({ albumId: 1, title: 'First', artistId: 1, artistName: 'Artist', tracks: [] });
    await vi.waitFor(() => expect(service.displayedPage()?.albumId).toBe(1));

    service.setCurrentAlbum(2);
    TestBed.tick();
    http.expectOne('/api/albums/2').flush({}, { status: 500, statusText: 'Server Error' });
    await vi.waitFor(() => expect(service.pageData.error()).toBeTruthy());

    expect(service.displayedPage()).toBeUndefined();
  });
});
