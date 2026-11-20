import { Component, effect, inject, untracked, ViewChild, ElementRef, ViewContainerRef, ComponentRef } from '@angular/core';
import { Router } from '@angular/router';
import { formatDuration } from '../tools';
import { NewAlbumComponent } from '../new-album/new-album';
import { TranslationService, Translator } from '../i18n/translation.service';
import { MessagesService } from '../messages';
import { LoginService } from '../login/login.service';
import { TracksService, SortType, SortDirection, isFirstPage, isLastPage } from './tracks.service';
import { Popup } from '../popup/popup';

@Component({
  selector: 'app-tracks',
  styleUrls: ['./tracks.css'],
  templateUrl: './tracks.html',
  imports: [Popup]
})
export class Tracks {
  private readonly tracksService = inject(TracksService);
  private readonly router = inject(Router);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly translations = inject(TranslationService);
  private readonly messages = inject(MessagesService);
  private readonly loginService = inject(LoginService);
  private newAlbumDialogRef?: ComponentRef<NewAlbumComponent>;

  readonly pageResource = this.tracksService.pageData;
  readonly hasSession = this.loginService.hasSession;
  readonly convertToMinutes = formatDuration;
  readonly t: Translator = this.translations.translate.bind(this.translations);
  readonly isFirstPage = isFirstPage;
  readonly isLastPage = isLastPage;

  constructor() {
    effect(() => {
      const error = this.pageResource.error();
      if (error) {
        untracked(() => this.messages.error(this.t('LOAD_TRACKS_FAILED')));
      }
    });
  }

  previousPage(): void {
    this.tracksService.previousPage();
  }

  nextPage(): void {
    this.tracksService.nextPage();
  }

  @ViewChild('searchInput')
  set searchInput(input: ElementRef<HTMLInputElement> | undefined) {
    input?.nativeElement.focus();
  }

  startSearch(): void {
    this.tracksService.setFilter('');
  }

  firstPage(): void {
    this.tracksService.setCurrentPage(0);
  }

  lastPage(): void {
    this.tracksService.setCurrentPage((this.tracksService.displayedPage()?.page.totalPages ?? 1) - 1);
  }

  setOrder(order: SortType, direction?: SortDirection): void {
    this.tracksService.setSort(order, direction ?? (this.tracksService.getDirection() === 'asc' ? 'desc' : 'asc'));
  }

  navigateToAlbum(albumId: number): void {
    this.router.navigate(['/albums', albumId]);
  }

  showNewAlbumDialog(): void {
    if (!this.newAlbumDialogRef) {
      const dialog = this.viewContainer.createComponent(NewAlbumComponent);
      // The dialog element must exist before open() reads the view query.
      dialog.changeDetectorRef.detectChanges();
      dialog.instance.closed.subscribe(() => this.destroyNewAlbumDialog());
      dialog.instance.created.subscribe(albumId => {
        this.destroyNewAlbumDialog();
        this.navigateToAlbum(albumId);
      });
      dialog.instance.existingAlbum.subscribe(albumId => {
        this.destroyNewAlbumDialog();
        this.navigateToAlbum(albumId);
      });
      this.newAlbumDialogRef = dialog;
    }
    this.newAlbumDialogRef.instance.open();
  }

  private destroyNewAlbumDialog(): void {
    this.newAlbumDialogRef?.destroy();
    this.newAlbumDialogRef = undefined;
  }
}
