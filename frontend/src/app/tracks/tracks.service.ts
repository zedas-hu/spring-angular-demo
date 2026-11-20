import { inject, Injectable, linkedSignal, resource, signal } from '@angular/core';
import { ApiService } from '../api.service';

export interface TrackRecord {
  trackId: number;
  name: string;
  albumId: number;
  albumTitle: string | null;
  artistName: string | null;
  genreId: number | null;
  genreName: string | null;
  mediaTypeId: number | null;
  mediaTypeName: string | null;
  composer: string | null;
  milliseconds: number | null;
  unitPrice: number | null;
}

export interface TrackCreateRequest {
  name: string;
  albumId: number;
  genreId: number;
  mediaTypeId: number;
  composer: string | null;
  milliseconds: number;
  unitPrice: number;
}

export interface PagedModel<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export const isFirstPage = (paged: PagedModel<unknown>): boolean => paged.page.number === 0;
export const isLastPage = (paged: PagedModel<unknown>): boolean => paged.page.number >= paged.page.totalPages - 1;

export type SortType = 'name' | 'albumTitle' | 'genreName' | 'mediaTypeName' | 'composer' | 'milliseconds' | 'albumArtistName';
export type SortDirection = 'asc' | 'desc';

@Injectable({ providedIn: 'root' })
export class TracksService {
  static readonly pageSize = 10;

  private readonly api = inject(ApiService);
  private readonly currentPage = signal(0);
  private readonly sort = signal<SortType>('name');
  private readonly filter = signal<string | undefined>(undefined);
  private readonly direction = signal<SortDirection>('asc');

  createTrack(request: TrackCreateRequest): Promise<TrackRecord> {
    return this.api.request<TrackRecord>('POST', '/api/tracks', {
      body: request,
      fallbackError: 'TRACK_CREATE_FAILED',
    });
  }

  updateTrack(trackId: number, request: TrackCreateRequest): Promise<TrackRecord> {
    return this.api.request<TrackRecord>('PUT', `/api/tracks/${trackId}`, {
      body: request,
      fallbackError: 'TRACK_UPDATE_FAILED',
    });
  }

  deleteTrack(trackId: number): Promise<void> {
    return this.api.request<void>('DELETE', `/api/tracks/${trackId}`, {
      fallbackError: 'TRACK_DELETE_FAILED',
    });
  }

  readonly pageData = resource<PagedModel<TrackRecord>, Record<string, string>>({
    params: () => ({
      page: String(this.currentPage()),
      size: String(TracksService.pageSize),
      sort: `${this.sort()},${this.direction()}`,
      filter: this.filter() ?? '',
    }),
    loader: async ({ params, abortSignal }) => {
      const paged = await this.api.request<PagedModel<TrackRecord>>('GET', '/api/tracks', {
        params,
        signal: abortSignal,
        fallbackError: 'TRACKS_FETCH_ERROR',
      });
      if (paged.page.number > 0 && paged.page.number >= paged.page.totalPages) {
        this.currentPage.set(Math.max(0, paged.page.totalPages - 1));
      }
      return paged;
    },
  });
  readonly displayedPage = linkedSignal<
    PagedModel<TrackRecord> | undefined,
    PagedModel<TrackRecord> | undefined
  >({
    source: () => this.pageData.hasValue() ? this.pageData.value() : undefined,
    computation: (page, previous) => page ?? previous?.value,
  });

  refreshPage(): void {
    this.pageData.reload();
  }

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
    if (!this.pageData.isLoading() && this.pageData.hasValue() && !isLastPage(this.pageData.value())) {
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