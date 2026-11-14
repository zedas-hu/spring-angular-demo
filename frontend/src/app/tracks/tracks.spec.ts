import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Tracks } from './tracks';
import { TracksService } from './tracks.service';

describe('Tracks', () => {
  let component: Tracks;
  let fixture: ComponentFixture<Tracks>;
  const getPage = vi.fn().mockReturnValue(of({
    content: [],
    empty: true,
    first: true,
    last: true,
    number: 0,
    numberOfElements: 0,
    totalElements: 0,
    totalPages: 0,
  }));

  beforeEach(async () => {
    getPage.mockClear();
    await TestBed.configureTestingModule({
      imports: [Tracks],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({ sort: 'name,desc' })),
          },
        },
        { provide: TracksService, useValue: { getPage } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Tracks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('passes the URL sort parameter to the tracks service', () => {
    expect(getPage).toHaveBeenCalledWith(0, Tracks.pageSize, 'name,desc');
  });
});
