import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, type WritableSignal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { provideRouter, Router } from '@angular/router';
import { Tracks } from './tracks';
import { PageResponse, TrackRecord, TracksService } from './tracks.service';
import { NewAlbumComponent } from '../new-album/new-album';
import { LoginService } from '../login/login.service';

describe('Tracks', () => {
  let component: Tracks;
  let fixture: ComponentFixture<Tracks>;
  let fetchMock: ReturnType<typeof vi.fn>;
  let hasSession: WritableSignal<boolean>;
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
    hasSession = signal(false);
    fetchMock = vi.fn(async (url: string) => ({
      ok: true,
      json: async () => pageResponse(Number(new URL(url, 'http://localhost').searchParams.get('page')), false),
    }));
    vi.stubGlobal('fetch', fetchMock);

    await TestBed.configureTestingModule({
      imports: [Tracks],
      providers: [
        provideRouter([]),
        { provide: LoginService, useValue: { hasSession } },
      ],
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

  it('shows a message when there are no track records', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('tbody td.empty').textContent).toContain('No records.');
  });

  it('shows the new album action only when a session exists', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('header .new')).toBeNull();

    hasSession.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('header .new')).not.toBeNull();
  });

  it('hides the page number when the page count is zero', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ ...pageResponse(0, true), totalElements: 0, totalPages: 0 }),
    });
    TestBed.inject(TracksService).setFilter('empty');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.pager span')).toBeNull();
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

  it('aborts the previous search request when the filter changes while loading', async () => {
    await fixture.whenStable();
    const tracksService = TestBed.inject(TracksService);
    let firstRequestSignal: AbortSignal | undefined;
    fetchMock
      .mockImplementationOnce((_url: string, options: RequestInit) => new Promise((_resolve, reject) => {
        firstRequestSignal = options.signal as AbortSignal;
        firstRequestSignal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
      }))
      .mockImplementationOnce(async (url: string) => ({
        ok: true,
        json: async () => pageResponse(Number(new URL(url, 'http://localhost').searchParams.get('page')), true),
      }));

    tracksService.setFilter('r');
    fixture.detectChanges();
    expect(firstRequestSignal?.aborted).toBe(false);

    tracksService.setFilter('ro');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(firstRequestSignal?.aborted).toBe(true);
    expect(lastRequestParams().get('filter')).toBe('ro');
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

    expect(navigate).toHaveBeenCalledWith(['/albums', 42]);
  });

  it('closes the new album dialog and opens the created album', async () => {
    await fixture.whenStable();

    // The test DOM does not implement showModal; open the dialog as a plain attribute instead.
    const showModal = HTMLDialogElement.prototype.showModal;
    HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
    try {
      const router = TestBed.inject(Router);
      const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      component.showNewAlbumDialog();
      fixture.debugElement.query(By.directive(NewAlbumComponent)).componentInstance.created.emit(7);

      expect(navigate).toHaveBeenCalledWith(['/albums', 7]);
      expect(fixture.nativeElement.querySelector('app-new-album')).toBeNull();

      component.showNewAlbumDialog();
      fixture.debugElement.query(By.directive(NewAlbumComponent)).componentInstance.existingAlbum.emit(8);

      expect(navigate).toHaveBeenCalledWith(['/albums', 8]);
      expect(fixture.nativeElement.querySelector('app-new-album')).toBeNull();
    } finally {
      HTMLDialogElement.prototype.showModal = showModal;
    }
  });

  it('creates the new album dialog on demand and opens it', () => {
    const showModal = HTMLDialogElement.prototype.showModal;
    HTMLDialogElement.prototype.showModal = function () { this.open = true; };

    try {
      expect(fixture.nativeElement.querySelector('app-new-album')).toBeNull();

      component.showNewAlbumDialog();

      const newAlbum = fixture.debugElement.query(By.directive(NewAlbumComponent));
      const dialog = newAlbum.nativeElement.querySelector('dialog') as HTMLDialogElement;
      expect(dialog.open).toBe(true);
    } finally {
      HTMLDialogElement.prototype.showModal = showModal;
    }
  });
});
