import { inject, Injectable, linkedSignal, resource, signal } from '@angular/core';
import { ApiService } from '../api.service';
import { TrackRecord } from '../tracks/tracks.service';

export interface AlbumRecord {
    albumId: number;
    title: string;
    artistId: number;
    artistName: string;
    tracks: TrackRecord[]
}

type FetchParams = {
    albumId: number;
} | undefined;

export interface AlbumCreateRequest {
    title: string;
    artistName: string;
    artistId: number | null;
}

@Injectable({ providedIn: 'root' })
export class AlbumService {
  private readonly api = inject(ApiService);
  private readonly currentAlbum = signal<number | null>(null);

  createAlbum(request: AlbumCreateRequest): Promise<AlbumRecord> {
    return this.api.request<AlbumRecord>('POST', '/api/albums', {
      body: request,
      fallbackError: 'ALBUM_CREATE_FAILED',
    });
  }
  
  readonly pageData = resource<AlbumRecord, FetchParams>({
    params: () => {
      const albumId = this.currentAlbum();
      return albumId && { albumId } || undefined;
    },
    loader: async ({ params, abortSignal }) => {
      if (params === undefined) {
        throw new Error('ALBUM_ID_REQUIRED');
      }

      return this.api.request<AlbumRecord>('GET', `/api/albums/${params.albumId}`, {
        signal: abortSignal,
        fallbackError: 'TRACKS_FETCH_ERROR',
      });
    },
  });

  readonly displayedPage = linkedSignal<
    AlbumRecord | undefined,
    AlbumRecord | undefined
  >({
    source: () => this.pageData.hasValue() ? this.pageData.value() : undefined,
    computation: (page, previous) => page ?? (
      previous?.value?.albumId === this.currentAlbum() ? previous.value : undefined
    ),
  });

  setCurrentAlbum(albumId: number | null): void {
    this.currentAlbum.set(albumId);
  }

  deleteAlbum(albumId: number): Promise<void> {
    return this.api.request<void>('DELETE', `/api/albums/${albumId}`, {
      fallbackError: 'ALBUM_DELETE_FAILED',
    });
  }
}