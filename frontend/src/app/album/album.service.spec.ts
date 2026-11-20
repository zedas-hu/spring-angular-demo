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
});
