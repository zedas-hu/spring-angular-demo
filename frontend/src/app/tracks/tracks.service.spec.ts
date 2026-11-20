import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { PagedModel, TrackCreateRequest, TracksService } from './tracks.service';

const emptyPage: PagedModel<never> = {
  content: [],
  page: { size: 10, number: 0, totalElements: 0, totalPages: 0 },
};

describe('TracksService', () => {
  let service: TracksService;
  let http: HttpTestingController;

  const trackPagesUrl = (req: { url: string }) => req.url === '/api/tracks';

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(TracksService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
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

    const result = service.updateTrack(42, request);

    const req = http.expectOne({ method: 'PUT', url: '/api/tracks/42' });
    expect(req.request.body).toEqual(request);
    req.flush({ trackId: 42, ...request });

    await expect(result).resolves.toMatchObject({ trackId: 42 });
  });

  it('deletes a track with a DELETE request', async () => {
    const result = service.deleteTrack(42);

    http.expectOne({ method: 'DELETE', url: '/api/tracks/42' }).flush(null, { status: 204, statusText: 'No Content' });

    await expect(result).resolves.toBeNull();
  });

  it('refetches the current track page when refreshed', async () => {
    TestBed.tick();
    const initial = http.expectOne(trackPagesUrl);
    initial.flush(emptyPage);
    await vi.waitFor(() => expect(service.pageData.hasValue()).toBe(true));

    service.refreshPage();
    TestBed.tick();

    const reloaded = http.expectOne(trackPagesUrl);
    expect(reloaded.request.urlWithParams).toBe(initial.request.urlWithParams);
    reloaded.flush(emptyPage);
  });

  it('moves to the last existing page when the current page is empty', async () => {
    service.setCurrentPage(2);
    TestBed.tick();

    http.expectOne((req) => trackPagesUrl(req) && req.params.get('page') === '2').flush({
      content: [],
      page: { size: 10, number: 2, totalElements: 2, totalPages: 2 },
    });

    await vi.waitFor(() => expect(service.getCurrentPage()).toBe(1));

    TestBed.tick();
    http.expectOne((req) => trackPagesUrl(req) && req.params.get('page') === '1').flush({
      content: [{ trackId: 1 }],
      page: { size: 10, number: 1, totalElements: 2, totalPages: 2 },
    });
  });

  it('keeps the last loaded page when a later refresh fails', async () => {
    TestBed.tick();
    http.expectOne(trackPagesUrl).flush({
      content: [{ trackId: 1 }],
      page: { size: 10, number: 0, totalElements: 1, totalPages: 1 },
    });
    await vi.waitFor(() => expect(service.displayedPage()?.content).toHaveLength(1));

    service.refreshPage();
    TestBed.tick();
    http.expectOne(trackPagesUrl).flush({}, { status: 500, statusText: 'Server Error' });
    await vi.waitFor(() => expect(service.pageData.error()).toBeTruthy());

    expect(service.displayedPage()?.content[0].trackId).toBe(1);
  });
});
