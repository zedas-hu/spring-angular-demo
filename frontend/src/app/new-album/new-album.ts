import { computed, Component, effect, ElementRef, viewChild, output, inject, signal, untracked } from '@angular/core';
import { form, FormField, FormRoot, required, validate, type FieldTree, type TreeValidationResult } from '@angular/forms/signals';
import { AlbumService } from '../album/album.service';
import { ApiError, ApiService } from '../api.service';
import { TranslationService, Translator } from '../i18n/translation.service';
import { KeyProvider } from '../keyprovider';
import { MessagesService } from '../messages';
import { Selector } from '../selector/selector';

interface NewAlbumModel {
  title: string;
  artistName: string;
  artistId: number | null;
}

@Component({
  selector: 'app-new-album',
  standalone: true,
  imports: [FormField, FormRoot, Selector],
  templateUrl: './new-album.html'
})
export class NewAlbumComponent {
  private readonly albumService = inject(AlbumService);
  private readonly api = inject(ApiService);
  private readonly translations = inject(TranslationService);
  private readonly messages = inject(MessagesService);
  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly albumModel = signal<NewAlbumModel>({ title: '', artistName: '', artistId: null });

  readonly closed = output<void>();
  readonly created = output<number>();
  readonly existingAlbum = output<number>();

  readonly formError = signal<string | null>(null);
  private readonly duplicateMatch = signal<{ title: string; albumId: number | null } | null>(null);
  // The match is shown only while the entered title is still the one it was found for.
  readonly duplicateAlbumId = computed(() => {
    const match = this.duplicateMatch();
    return match && match.title === this.albumModel().title.trim() ? match.albumId : null;
  });
  readonly artistKeyProvider = new KeyProvider(this.api, 'artists');
  private readonly albumKeyProvider = new KeyProvider(this.api, 'albums');

  readonly t: Translator = this.translations.translate.bind(this.translations);

  readonly albumForm = form(
    this.albumModel,
    (path) => {
      required(path.title, { message: 'TITLE_REQUIRED' });
      required(path.artistName, { message: 'ARTIST_NAME_REQUIRED' });
      validate(path.artistName, ({ value }) => {
        const artistName = value();
        return artistName.length > 0 && artistName.trim().length === 0
          ? { kind: 'required', message: 'ARTIST_NAME_REQUIRED' }
          : undefined;
      });
    },
    { submission: { action: () => this.createAlbum() } },
  );

  constructor() {
    effect(() => {
      const message = this.formError();
      if (message) {
        untracked(() => this.messages.error(
          this.translations.translateError(message, 'ALBUM_CREATE_FAILED'),
        ));
      }
    });
  }

  setArtistId(artistId: number | undefined): void {
    this.albumModel.update((album) => ({ ...album, artistId: artistId ?? null }));
  }

  private async createAlbum(): Promise<TreeValidationResult> {
    const { title, artistName, artistId: selectedArtistId } = this.albumForm().value();
    this.formError.set(null);
    this.duplicateMatch.set(null);

    // The selector may not have loaded the artist list yet, so resolve the name here before the backend creates an artist.
    let artistId = selectedArtistId;
    if (artistId === null) {
      try {
        const artists = await this.artistKeyProvider.getKeyList();
        artistId = artists.find((artist) => artist.value === artistName.trim())?.key ?? null;
      } catch (lookupError) {
        if (!(lookupError instanceof Error)) {
          throw lookupError;
        }
        this.formError.set('ARTIST_LOOKUP_FAILED');
        return undefined;
      }
    }

    try {
      const album = await this.albumService.createAlbum({
        title,
        artistName: artistName.trim(),
        artistId,
      });
      this.created.emit(album.albumId);
      return undefined;
    } catch (error) {
      if (!(error instanceof ApiError)) {
        this.formError.set('ALBUM_CREATE_FAILED');
        return undefined;
      }

      if (error.detail === 'TITLE_DUPLICATION') {
        try {
          // The backend stores the stripped title, so the lookup must use the same form.
          const trimmedTitle = title.trim();
          const albums = await this.albumKeyProvider.getKeyList();
          this.duplicateMatch.set({
            title: trimmedTitle,
            albumId: albums.find((album) => album.value === trimmedTitle)?.key ?? null,
          });
        } catch (lookupError) {
          if (!(lookupError instanceof Error)) {
            throw lookupError;
          }
          this.formError.set('ALBUM_LOOKUP_FAILED');
        }
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

  openExistingAlbum(): void {
    const albumId = this.duplicateAlbumId();
    if (albumId !== null) {
      this.existingAlbum.emit(albumId);
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