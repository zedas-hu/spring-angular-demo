import { Component, ElementRef, viewChild, output, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, required, type FieldTree, type TreeValidationResult } from '@angular/forms/signals';
import { AlbumCreateError, AlbumService } from '../album/album.service';
import { TranslationService, Translator } from '../i18n/translation.service';

interface NewAlbumModel {
  title: string;
  artistName: string;
}

@Component({
  selector: 'app-new-album',
  standalone: true,
  imports: [FormField, FormRoot],
  templateUrl: './new-album.html',
  styleUrls: ['./new-album.css']
})
export class NewAlbumComponent {
  private readonly albumService = inject(AlbumService);
  private readonly translations = inject(TranslationService);
  private dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  closed = output<void>();
  created = output<number>();

  readonly formError = signal<string | null>(null);

  // readonly t = (code?: string) => this.translations.translate(code ?? '');
  readonly t: Translator = this.translations.translate.bind(this.translations);

  readonly albumForm = form(
    signal<NewAlbumModel>({ title: '', artistName: '' }),
    (path) => {
      required(path.title, { message: 'TITLE_REQUIRED' });
      required(path.artistName, { message: 'ARTIST_NAME_REQUIRED' });
    },
    { submission: { action: () => this.createAlbum() } },
  );

  private async createAlbum(): Promise<TreeValidationResult> {
    const { title, artistName } = this.albumForm().value();
    this.formError.set(null);

    try {
      const album = await this.albumService.createAlbum({ title, artistName });
      this.created.emit(album.albumId);
      return undefined;
    } catch (error) {
      if (!(error instanceof AlbumCreateError)) {
        this.formError.set('ALBUM_CREATE_FAILED');
        return undefined;
      }

      const fields: Record<string, FieldTree<string>> = {
        title: this.albumForm.title,
        artistName: this.albumForm.artistName,
      };
      const fieldErrors = Object.entries(error.fieldErrors)
        .filter(([name]) => name in fields)
        .map(([name, message]) => ({ kind: 'server', fieldTree: fields[name], message }));

      if (fieldErrors.length > 0) {
        return fieldErrors;
      }
      this.formError.set(error.detail);
      return undefined;
    }
  }

  private readonly closeEvent = () => {
    const dialog = this.dialogRef().nativeElement;
    dialog.removeEventListener('close', this.closeEvent);
    this.closed.emit();
  };

  open(): void {
    const dialog = this.dialogRef().nativeElement;
    if (!dialog.open) {
      dialog.addEventListener('close', this.closeEvent);
      dialog.showModal();
    }
  }

  close(): void {
    this.dialogRef().nativeElement.close();
  }
}