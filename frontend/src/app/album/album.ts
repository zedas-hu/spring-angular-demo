import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { AlbumService } from './album.service';

@Component({
  selector: 'app-album',
  styleUrls: ['./album.css'],
  templateUrl: './album.html',
})
export class Album {
  private readonly albumService = inject(AlbumService);
  private readonly route = inject(ActivatedRoute);
  private readonly routeParams = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  readonly selectedAlbumId = computed(() => {
    const value = this.routeParams().get('albumId');
    if (value === null) return null;

    const albumId = Number(value);
    return Number.isInteger(albumId) && albumId > 0 ? albumId : null;
  });

  constructor() {
    this.syncAlbum();
    effect(() => this.syncAlbum());
  }

  private syncAlbum(): void {
    this.albumService.setCurrentAlbum(this.selectedAlbumId());
  }

  readonly pageResource = this.albumService.pageData;

  convertToMinutes(milliseconds: number | null): string {
    if (!milliseconds) return '';
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
