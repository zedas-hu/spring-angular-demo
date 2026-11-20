import { inject, Injectable, linkedSignal, resource, Signal } from '@angular/core';
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

  createAlbum(request: AlbumCreateRequest): Promise<AlbumRecord> {
    return this.api.request<AlbumRecord>('POST', '/api/albums', {
      body: request,
      fallbackError: 'ALBUM_CREATE_FAILED',
    });
  }
  
  createAlbumPage(albumId: Signal<number | null>) {
    const pageData = resource<AlbumRecord, FetchParams>({
      params: () => {
        const id = albumId();
        return id && { albumId: id } || undefined;
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

    const displayedPage = linkedSignal<
      AlbumRecord | undefined,
      AlbumRecord | undefined
    >({
      source: () => pageData.hasValue() ? pageData.value() : undefined,
      computation: (page, previous) => page ?? (
        previous?.value?.albumId === albumId() ? previous.value : undefined
      ),
    });

    return { pageData, displayedPage };
  }

  deleteAlbum(albumId: number): Promise<void> {
    return this.api.request<void>('DELETE', `/api/albums/${albumId}`, {
      fallbackError: 'ALBUM_DELETE_FAILED',
    });
  }
}