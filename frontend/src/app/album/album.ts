import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
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

  constructor() {
    this.syncAlbum();
    effect(() => this.syncAlbum());
  }

  private syncAlbum(): void {
    this.albumService.setCurrentAlbum(this.selectedAlbumId());
  }

  errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
