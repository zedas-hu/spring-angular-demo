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

export interface AlbumCreateRequest {
    title: string;
    artistName: string;
    artistId: number | null;
}

export class AlbumCreateError extends Error {
    constructor(
        readonly detail: string,
        readonly fieldErrors: Record<string, string>,
    ) {
        super(detail);
    }
}

@Injectable({ providedIn: 'root' })
export class AlbumService {
  // private readonly http = inject(HttpClient);
  private readonly currentAlbum = signal<number | null>(null);

  async createAlbum(request: AlbumCreateRequest): Promise<AlbumRecord> {
    const response = await fetch('/api/albums', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const problem = await response.json().catch(() => ({})) as {
        detail?: string;
        fieldErrors?: Record<string, string>;
      };
      throw new AlbumCreateError(problem.detail ?? 'ALBUM_CREATE_FAILED', problem.fieldErrors ?? {});
    }

    return response.json();
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

  async deleteAlbum(albumId: number): Promise<void> {
    const response = await fetch(`/api/albums/${albumId}`, { method: 'DELETE' });

    if (!response.ok) {
      throw new Error('ALBUM_DELETE_FAILED');
    }
  }
}