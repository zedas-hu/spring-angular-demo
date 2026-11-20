import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ApiService } from './api.service';
import { KeyProvider, type KeyRecord } from './keyprovider';

describe('KeyProvider', () => {
  const albumKeys: KeyRecord[] = [{ key: 1, value: 'Album' }];
  const artistKeys: KeyRecord[] = [{ key: 2, value: 'Artist' }];
  let api: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('fetches lazily and shares/caches the first request', async () => {
    const service = new KeyProvider(api, 'albums');

    http.expectNone('/api/albums/keys');

    const firstRequest = service.getKeyList();
    const concurrentRequest = service.getKeyList();
    http.expectOne('/api/albums/keys').flush(albumKeys);
    const [firstResult, concurrentResult] = await Promise.all([firstRequest, concurrentRequest]);

    expect(firstResult).toEqual(albumKeys);
    expect(concurrentResult).toBe(firstResult);
    expect(await service.getKeyList()).toBe(firstResult);
    http.expectNone('/api/albums/keys');
  });

  it('keeps independently created providers scoped to their type', async () => {
    const albums = new KeyProvider(api, 'albums');
    const artists = new KeyProvider(api, 'artists');

    const albumsRequest = albums.getKeyList();
    const artistsRequest = artists.getKeyList();
    http.expectOne('/api/albums/keys').flush(albumKeys);
    http.expectOne('/api/artists/keys').flush(artistKeys);

    await expect(albumsRequest).resolves.toEqual(albumKeys);
    await expect(artistsRequest).resolves.toEqual(artistKeys);
  });
});
