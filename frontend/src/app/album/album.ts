import { Component, ComponentRef, computed, effect, inject, untracked, ViewContainerRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { formatDuration } from '../tools';
import { TranslationService, Translator } from '../i18n/translation.service';
import { MessagesService } from '../messages';
import { AlbumService } from './album.service';
import { NewTrack } from '../new-track/new-track';
import { TrackRecord, TracksService } from '../tracks/tracks.service';
import { LoginService } from '../login/login.service';

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
  private readonly tracksService = inject(TracksService);
  private readonly translations = inject(TranslationService);
  private readonly messages = inject(MessagesService);
  private readonly loginService = inject(LoginService);
  private trackDialogRef?: ComponentRef<NewTrack>;
  private readonly routeParams = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  readonly selectedAlbumId = computed(() => {
    const value = this.routeParams().get('albumId');
    if (value === null) return null;

    const albumId = Number(value);
    return Number.isInteger(albumId) && albumId > 0 ? albumId : null;
  });
  private readonly albumPage = this.albumService.createAlbumPage(this.selectedAlbumId);
  readonly pageResource = this.albumPage.pageData;
  readonly displayedPage = this.albumPage.displayedPage;
  readonly sessionLoaded = this.loginService.hasSession;
  readonly convertToMinutes = formatDuration;
  readonly t: Translator = this.translations.translate.bind(this.translations);

  constructor() {
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
      this.tracksService.refreshPage();
      await this.router.navigate(['/tracks']);
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }
      this.messages.error(this.translations.translateError(error.message, 'ALBUM_DELETE_FAILED'));
    }
  }

  async deleteTrack(trackId: number): Promise<void> {
    if (!window.confirm(this.t('DELETE_TRACK_CONFIRM'))) {
      return;
    }

    try {
      await this.tracksService.deleteTrack(trackId);
      this.reloadAlbumAndTracks();
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }
      this.messages.error(
        this.translations.translateError(error.message, 'TRACK_DELETE_FAILED'),
      );
    }
  }

  editTrack(trackId: number): void {
    const track = this.displayedPage()?.tracks.find(
      candidate => candidate.trackId === trackId,
    );
    if (!track) {
      this.messages.error(this.t('TRACK_NOT_FOUND'));
      return;
    }

    this.openTrackDialog(track.albumId, track);
  }

  createTrack(): void {
    const albumId = this.selectedAlbumId();
    if (albumId === null) {
      return;
    }

    this.openTrackDialog(albumId);
  }

  private openTrackDialog(albumId: number, track: TrackRecord | null = null): void {
    if (!this.trackDialogRef) {
      const dialog = this.viewContainer.createComponent(NewTrack);
      dialog.setInput('albumId', albumId);
      dialog.setInput('track', track);
      dialog.changeDetectorRef.detectChanges();
      dialog.instance.closed.subscribe(() => this.destroyNewTrackDialog());
      const reloadAlbum = () => {
        this.destroyNewTrackDialog();
        this.reloadAlbumAndTracks();
      };
      dialog.instance.created.subscribe(reloadAlbum);
      dialog.instance.updated.subscribe(reloadAlbum);
      this.trackDialogRef = dialog;
    }

    this.trackDialogRef.instance.open();
  }

  private reloadAlbumAndTracks(): void {
    this.pageResource.reload();
    this.tracksService.refreshPage();
  }

  private destroyNewTrackDialog(): void {
    this.trackDialogRef?.destroy();
    this.trackDialogRef = undefined;
  }

}
