import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { KeyProvider, type KeyRecord } from './keyprovider';

describe('KeyProvider', () => {
  const albumKeys: KeyRecord[] = [{ key: 1, value: 'Album' }];
  const artistKeys: KeyRecord[] = [{ key: 2, value: 'Artist' }];
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn(async (url: string) => ({
      ok: true,
      json: async () => url.endsWith('/albums/keys') ? albumKeys : artistKeys,
    }));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches lazily and shares/caches the first request', async () => {
    const service = new KeyProvider('albums');

    expect(fetchMock).not.toHaveBeenCalled();

    const firstRequest = service.getKeyList();
    const concurrentRequest = service.getKeyList();
    const [firstResult, concurrentResult] = await Promise.all([firstRequest, concurrentRequest]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/albums/keys');
    expect(firstResult).toBe(albumKeys);
    expect(concurrentResult).toBe(firstResult);
    expect(await service.getKeyList()).toBe(firstResult);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('keeps independently created providers scoped to their type', async () => {
    const albums = new KeyProvider('albums');
    const artists = new KeyProvider('artists');

    await expect(albums.getKeyList()).resolves.toBe(albumKeys);
    await expect(artists.getKeyList()).resolves.toBe(artistKeys);

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/albums/keys');
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/artists/keys');
  });
});
