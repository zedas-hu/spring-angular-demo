import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideRouter, Router } from '@angular/router';
import { Tracks } from './tracks';
import { PageResponse, TrackRecord, TracksService } from './tracks.service';

describe('Tracks', () => {
  let component: Tracks;
  let fixture: ComponentFixture<Tracks>;
  let fetchMock: ReturnType<typeof vi.fn>;
  const pageResponse = (number: number, last: boolean): PageResponse<TrackRecord> => ({
    content: [],
    empty: true,
    first: number === 0,
    last,
    number,
    numberOfElements: 0,
    totalElements: last ? number * TracksService.pageSize : (number + 2) * TracksService.pageSize,
    totalPages: last ? number + 1 : number + 2,
  });
  const lastRequestParams = (): URLSearchParams => {
    const [url] = fetchMock.mock.calls.at(-1)!;
    return new URL(url as string, 'http://localhost').searchParams;
  };

  beforeEach(async () => {
    fetchMock = vi.fn(async (url: string) => ({
      ok: true,
      json: async () => pageResponse(Number(new URL(url, 'http://localhost').searchParams.get('page')), false),
    }));
    vi.stubGlobal('fetch', fetchMock);

    await TestBed.configureTestingModule({
      imports: [Tracks],
      providers: [provideRouter([])],
    }).compileComponents();

    TestBed.inject(TracksService).setSort('name', 'desc');
    fixture = TestBed.createComponent(Tracks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create', async () => {
    await fixture.whenStable();
    expect(component).toBeTruthy();
  });

  it('requests the service sort on the first page', async () => {
    await fixture.whenStable();

    const params = lastRequestParams();
    expect(params.get('page')).toBe('0');
    expect(params.get('size')).toBe(String(TracksService.pageSize));
    expect(params.get('sort')).toBe('name,desc');
  });

  it('requests the next page through the service pager', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.pager button:last-child').click();
    await fixture.whenStable();

    expect(lastRequestParams().get('page')).toBe('1');
    expect(lastRequestParams().get('sort')).toBe('name,desc');
    expect(component.pageResource.value()?.number).toBe(1);
  });

  it('keeps sort, filter, and page when the component is recreated', async () => {
    await fixture.whenStable();

    const tracksService = TestBed.inject(TracksService);
    tracksService.setSort('albumTitle', 'desc');
    tracksService.setFilter('rock');
    tracksService.setCurrentPage(2);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(lastRequestParams().get('page')).toBe('2');
    expect(lastRequestParams().get('sort')).toBe('albumTitle,desc');
    expect(lastRequestParams().get('filter')).toBe('rock');

    const requestCount = fetchMock.mock.calls.length;
    fixture.destroy();
    const recreated = TestBed.createComponent(Tracks);
    recreated.detectChanges();
    await recreated.whenStable();

    expect(fetchMock).toHaveBeenCalledTimes(requestCount);
    expect(recreated.nativeElement.querySelector('.pager span').textContent).toContain('Page 3 of 4');
  });

  it('passes the album id when navigating to an album', async () => {
    await fixture.whenStable();

    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.navigateToAlbum(42);

    expect(navigate).toHaveBeenCalledWith(['/album', 42]);
  });

  it('creates the new album dialog on demand and opens it', () => {
    expect(fixture.nativeElement.querySelector('app-new-album')).toBeNull();

    component.showNewAlbumDialog();

    const dialog = fixture.nativeElement.querySelector('app-new-album dialog') as HTMLDialogElement;
    expect(dialog.open).toBe(true);
  });
});
