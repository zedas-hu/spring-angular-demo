import { Injectable, linkedSignal, resource, signal } from '@angular/core';
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

@Injectable({ providedIn: 'root' })
export class AlbumService {
  // private readonly http = inject(HttpClient);
  private readonly currentAlbum = signal<number | null>(null);
  readonly pageData = resource<AlbumRecord, FetchParams>({
    params: () => {
      const albumId = this.currentAlbum();
      return albumId && { albumId } || undefined;
    },
    loader: async ({ params, abortSignal }) => {
      if (params === undefined) {
        throw new Error('ALBUM_ID_REQUIRED');
      }

      const response = await fetch(`/api/albums/${params.albumId}`, { signal: abortSignal });

      if (!response.ok)
        throw new Error('TRACKS_FETCH_ERROR');

      return response.json();
    },
  });
  readonly displayedPage = linkedSignal<
    AlbumRecord | undefined,
    AlbumRecord | undefined
  >({
    source: () => this.pageData.value(),
    computation: (page, previous) => page ?? previous?.value,
  });

  setCurrentAlbum(albumId: number | null): void {
    this.currentAlbum.set(albumId);
  }
}