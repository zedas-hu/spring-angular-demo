import { Component, ComponentRef, computed, effect, inject, untracked, ViewContainerRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { formatDuration } from '../tools';
import { TranslationService, Translator } from '../i18n/translation.service';
import { MessagesService } from '../messages';
import { AlbumService } from './album.service';
import { NewTrack } from '../new-track/new-track';

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
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly translations = inject(TranslationService);
  private readonly messages = inject(MessagesService);
  private newTrackDialog?: ComponentRef<NewTrack>;
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
    effect(() => {
      const routeAlbumId = this.routeParams().get('albumId');
      if (routeAlbumId === null || this.selectedAlbumId() === null) {
        untracked(() => this.messages.error(this.t('INVALID_ALBUM_ID')));
      }
    });
    effect(() => {
      const error = this.pageResource.error();
      if (error) {
        untracked(() => this.messages.error(this.t('LOAD_ALBUM_FAILED')));
      }
    });
  }

  async deleteAlbum(): Promise<void> {
    const albumId = this.selectedAlbumId();
    if (albumId === null || !window.confirm(this.t('DELETE_ALBUM_CONFIRM'))) {
      return;
    }

    try {
      await this.albumService.deleteAlbum(albumId);
      await this.router.navigate(['/tracks']);
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }
      this.messages.error(this.t('ALBUM_DELETE_FAILED'));
    }
  }

  createTrack(): void {
    const albumId = this.selectedAlbumId();
    if (albumId === null) {
      return;
    }

    if (!this.newTrackDialog) {
      const dialog = this.viewContainer.createComponent(NewTrack);
      dialog.setInput('albumId', albumId);
      dialog.changeDetectorRef.detectChanges();
      dialog.instance.closed.subscribe(() => this.destroyNewTrackDialog());
      dialog.instance.created.subscribe(() => {
        this.destroyNewTrackDialog();
        this.pageResource.reload();
      });
      this.newTrackDialog = dialog;
    }

    this.newTrackDialog.instance.open();
  }

  private syncAlbum(): void {
    this.albumService.setCurrentAlbum(this.selectedAlbumId());
  }

  private destroyNewTrackDialog(): void {
    this.newTrackDialog?.destroy();
    this.newTrackDialog = undefined;
  }

}
