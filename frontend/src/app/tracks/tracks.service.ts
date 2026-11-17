// import { HttpClient } from '@angular/common/http';
import { Injectable, linkedSignal, resource, signal } from '@angular/core';
// import { rxResource } from '@angular/core/rxjs-interop';

export interface TrackRecord {
  trackId: number;
  name: string;
  albumId: number;
  albumTitle: string | null;
  artistName: string | null;
  genreName: string | null;
  mediaTypeName: string | null;
  composer: string | null;
  milliseconds: number | null;
  unitPrice: number | null;
}

export interface PageResponse<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  totalElements: number;
  totalPages: number;
}

export type SortType = 'name' | 'albumTitle' | 'genreName' | 'mediaTypeName' | 'composer' | 'milliseconds' | 'albumArtistName';
export type SortDirection = 'asc' | 'desc';

@Injectable({ providedIn: 'root' })
export class TracksService {
  static readonly pageSize = 10;

  // private readonly http = inject(HttpClient);
  private readonly currentPage = signal(0);
  private readonly sort = signal<SortType>('name');
  private readonly filter = signal<string | undefined>(undefined);
  private readonly direction = signal<SortDirection>('asc');
  // public readonly pageData = rxResource<PageResponse<TrackRecord>, ResourceParams>({
  //   params: () => ({
  //     page: this.currentPage(),
  //     size: TracksService.pageSize,
  //     sort: `${this.sort()},${this.direction()}`,
  //   }),
  //   stream: ({ params }) => this.http.get<PageResponse<TrackRecord>>('/api/tracks', {
  //     params,
  //   }),
  // });
  readonly pageData = resource<PageResponse<TrackRecord>, URLSearchParams>({
    params: () => new URLSearchParams({
      page: String(this.currentPage()),
      size: String(TracksService.pageSize),
      sort: `${this.sort()},${this.direction()}`,
      filter: this.filter() ?? '',
    }),
    loader: async ({ params, abortSignal }) => {
      const response = await fetch(`/api/tracks?${params}`, { signal: abortSignal });

      if (!response.ok)
        throw new Error('TRACKS_FETCH_ERROR');

      return response.json();
    },
  });
  readonly displayedPage = linkedSignal<
    PageResponse<TrackRecord> | undefined,
    PageResponse<TrackRecord> | undefined
  >({
    source: () => this.pageData.value(),
    computation: (page, previous) => page ?? previous?.value,
  });

  setCurrentPage(page: number): void {
    this.currentPage.set(Math.max(0, page));
  }

  setSort(sort: SortType, direction = this.direction()): void {
    this.sort.set(sort);
    this.direction.set(direction);
    this.currentPage.set(0);
  }

  setDirection(direction: SortDirection): void {
    this.direction.set(direction);
    this.currentPage.set(0);
  }

  setFilter(filter: string | undefined): void {
    this.filter.set(filter);
    this.currentPage.set(0);
  }

  previousPage(): void {
    this.currentPage.update((page) => page > 0 ? page - 1 : 0);
  }

  nextPage(): void {
    if (!this.pageData.isLoading() && this.pageData.hasValue() && !this.pageData.value().last) {
      this.currentPage.update((page) => page + 1);
    }
  }

  getSort(): SortType {
    return this.sort();
  }

  getDirection(): SortDirection {
    return this.direction();
  }

  getCurrentPage(): number {
    return this.currentPage();
  }

  getFilter(): string | undefined {
    return this.filter();
  }
}