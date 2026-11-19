import { Component, inject, ViewChild, ElementRef, ViewContainerRef, ComponentRef } from '@angular/core';
import { Router } from '@angular/router';
import { formatDuration } from '../tools';
import { NewAlbumComponent } from '../new-album/new-album';
import { TranslationService, Translator } from '../i18n/translation.service';
import { TracksService, SortType, SortDirection } from './tracks.service';
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
  private newAlbumDialog?: ComponentRef<NewAlbumComponent>;

  readonly pageResource = this.tracksService.pageData;
  readonly convertToMinutes = formatDuration;
  readonly t: Translator = this.translations.translate.bind(this.translations);

  errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
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
    this.tracksService.setCurrentPage((this.tracksService.displayedPage()?.totalPages ?? 1) - 1);
  }

  setOrder(order: SortType, direction?: SortDirection): void {
    this.tracksService.setSort(order, direction ?? (this.tracksService.getDirection() === 'asc' ? 'desc' : 'asc'));
  }

  navigateToAlbum(albumId: number): void {
    this.router.navigate(['/albums', albumId]);
  }

  showNewAlbumDialog(): void {
    if (!this.newAlbumDialog) {
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
      this.newAlbumDialog = dialog;
    }
    this.newAlbumDialog.instance.open();
  }

  private destroyNewAlbumDialog(): void {
    this.newAlbumDialog?.destroy();
    this.newAlbumDialog = undefined;
  }
}
