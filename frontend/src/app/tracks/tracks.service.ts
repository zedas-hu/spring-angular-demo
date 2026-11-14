import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface Track {
  trackId: number;
  name: string;
  albumTitle: string | null;
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

@Injectable({ providedIn: 'root' })
export class TracksService {
  private readonly http = inject(HttpClient);

  getPage(page = 0, size = 20, sort?: string) {
    const params: Record<string, string | number> = { page, size };
    if (sort) params['sort'] = sort;
    return this.http.get<PageResponse<Track>>('/api/tracks', {
      params,
    });
  }
}