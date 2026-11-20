import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { TrackCreateRequest, TracksService } from './tracks.service';

describe('TracksService', () => {
  let service: TracksService;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        content: [],
        empty: true,
        first: true,
        last: true,
        number: 0,
        numberOfElements: 0,
        totalElements: 0,
        totalPages: 0,
      }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    TestBed.configureTestingModule({});
    service = TestBed.inject(TracksService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('updates the selected sort and direction', () => {
    service.setSort('genreName', 'desc');

    expect(service.getSort()).toBe('genreName');
    expect(service.getDirection()).toBe('desc');
  });

  it('updates a track with a PUT request', async () => {
    const request: TrackCreateRequest = {
      name: 'Updated track',
      albumId: 7,
      genreId: 2,
      mediaTypeId: 1,
      composer: null,
      milliseconds: 225000,
      unitPrice: 0.99,
    };

    await service.updateTrack(42, request);

    expect(fetchMock).toHaveBeenCalledWith('/api/tracks/42', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  });

  it('deletes a track with a DELETE request', async () => {
    await service.deleteTrack(42);

    expect(fetchMock).toHaveBeenCalledWith('/api/tracks/42', { method: 'DELETE' });
  });

  it('refetches the current track page when refreshed', async () => {
    TestBed.tick();
    await vi.waitFor(() => expect(service.pageData.hasValue()).toBe(true));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    service.refreshPage();
    TestBed.tick();

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[1][0]).toBe(fetchMock.mock.calls[0][0]);
  });

  it('moves to the last existing page when the current page is empty', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      const page = Number(new URL(url, 'http://localhost').searchParams.get('page'));
      return {
        ok: true,
        json: async () => ({
          content: page < 2 ? [{ trackId: page }] : [],
          empty: page >= 2,
          first: page === 0,
          last: page === 1,
          number: page,
          numberOfElements: page < 2 ? 1 : 0,
          totalElements: 2,
          totalPages: 2,
        }),
      };
    });

    service.setCurrentPage(2);
    TestBed.tick();

    await vi.waitFor(() => expect(service.getCurrentPage()).toBe(1));
  });
});
