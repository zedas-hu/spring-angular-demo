import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { Tracks } from './tracks';
import { PageResponse, TrackRecord, TracksService } from './tracks.service';

describe('Tracks', () => {
  let component: Tracks;
  let fixture: ComponentFixture<Tracks>;
  let httpTesting: HttpTestingController;
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

  beforeEach(async () => {
    const queryParamMap = convertToParamMap({ sort: 'name,desc' });
    await TestBed.configureTestingModule({
      imports: [Tracks],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(queryParamMap),
            snapshot: { queryParamMap },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Tracks);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', async () => {
    httpTesting.expectOne((request) => request.url === '/api/tracks').flush(pageResponse(0, true));
    await fixture.whenStable();
    expect(component).toBeTruthy();
  });

  it('requests the URL sort on the first page', async () => {
    const request = httpTesting.expectOne((request) => request.url === '/api/tracks');

    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('0');
    expect(request.request.params.get('size')).toBe('20');
    expect(request.request.params.get('sort')).toBe('name,desc');

    request.flush(pageResponse(0, false));
    await fixture.whenStable();
  });

  it('requests the next page through the service pager', async () => {
    httpTesting.expectOne((request) => request.url === '/api/tracks').flush(pageResponse(0, false));
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.pager button:last-child').click();
    fixture.detectChanges();

    const request = httpTesting.expectOne((request) => request.url === '/api/tracks');
    expect(request.request.params.get('page')).toBe('1');
    expect(request.request.params.get('sort')).toBe('name,desc');

    request.flush(pageResponse(1, true));
    await fixture.whenStable();
    expect(component.pageResource.value()?.number).toBe(1);
  });
});
