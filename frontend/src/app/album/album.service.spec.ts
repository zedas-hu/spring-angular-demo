import { TestBed } from '@angular/core/testing';
import { afterEach, vi } from 'vitest';
import { AlbumService } from '../album/album.service';

describe('Album', () => {
  let service: AlbumService;

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlbumService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('sends a DELETE request for the album', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await service.deleteAlbum(42);

    expect(fetchMock).toHaveBeenCalledWith('/api/albums/42', { method: 'DELETE' });
  });

  it('reports a failed delete request', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);

    await expect(service.deleteAlbum(42)).rejects.toThrow('ALBUM_DELETE_FAILED');
  });

  it('preserves the backend error code when deleting an album fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'ALBUM_DELETE_REFERENCED' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(service.deleteAlbum(42)).rejects.toThrow('ALBUM_DELETE_REFERENCED');
  });

  it('does not show the previous album when loading another album fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => (
      url.endsWith('/1')
        ? { ok: true, json: async () => ({ albumId: 1, title: 'First', artistId: 1, artistName: 'Artist', tracks: [] }) }
        : { ok: false, json: async () => ({}) }
    )));

    service.setCurrentAlbum(1);
    TestBed.tick();
    await vi.waitFor(() => expect(service.displayedPage()?.albumId).toBe(1));

    service.setCurrentAlbum(2);
    TestBed.tick();
    await vi.waitFor(() => expect(service.pageData.error()).toBeTruthy());

    expect(service.displayedPage()).toBeUndefined();
  });
});
