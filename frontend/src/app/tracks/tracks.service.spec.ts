import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { TracksService } from './tracks.service';

describe('TracksService', () => {
  let service: TracksService;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
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
    })));

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
});
