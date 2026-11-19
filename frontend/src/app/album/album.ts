import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { formatDuration } from '../tools';
import { TranslationService, Translator } from '../i18n/translation.service';
import { AlbumService } from './album.service';

@Component({
  selector: 'app-album',
  styleUrls: ['./album.css'],
  templateUrl: './album.html',
  imports: [RouterLink],
})
export class Album {
  private readonly albumService = inject(AlbumService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translations = inject(TranslationService);
  private readonly routeParams = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  readonly selectedAlbumId = computed(() => {
    const value = this.routeParams().get('albumId');
    if (value === null) return null;

    const albumId = Number(value);
    return Number.isInteger(albumId) && albumId > 0 ? albumId : null;
  });
  readonly pageResource = this.albumService.pageData;
  readonly convertToMinutes = formatDuration;
  readonly t: Translator = this.translations.translate.bind(this.translations);
  readonly deleteError = signal<string | null>(null);

  constructor() {
    this.syncAlbum();
    effect(() => this.syncAlbum());
  }

  async deleteAlbum(): Promise<void> {
    const albumId = this.selectedAlbumId();
    if (albumId === null || !window.confirm(this.t('DELETE_ALBUM_CONFIRM'))) {
      return;
    }

    this.deleteError.set(null);
    try {
      await this.albumService.deleteAlbum(albumId);
      await this.router.navigate(['/tracks']);
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }
      this.deleteError.set('ALBUM_DELETE_FAILED');
    }
  }

  private syncAlbum(): void {
    this.albumService.setCurrentAlbum(this.selectedAlbumId());
  }

  errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
