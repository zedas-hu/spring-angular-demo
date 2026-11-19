import { Component, effect, ElementRef, inject, input, output, resource, signal, untracked, viewChild } from '@angular/core';
import { form, FormField, FormRoot, required, validate, type FieldTree, type TreeValidationResult } from '@angular/forms/signals';
import { TrackCreateError, TracksService } from '../tracks/tracks.service';
import { TranslationService, Translator } from '../i18n/translation.service';
import { MessagesService } from '../messages';

interface GenreOption {
  genreId: number;
  name: string | null;
}

interface MediaTypeOption {
  mediaTypeId: number;
  name: string;
}

interface TrackOptions {
  genres: GenreOption[];
  mediaTypes: MediaTypeOption[];
}

interface NewTrackModel {
  name: string;
  genreId: string;
  mediaTypeId: string;
  composer: string;
  duration: string;
  unitPrice: number;
}

@Component({
  imports: [FormField, FormRoot],
  selector: 'app-new-track',
  styleUrl: './new-track.css',
  templateUrl: './new-track.html',
})
export class NewTrack {
  private readonly tracksService = inject(TracksService);
  private readonly translations = inject(TranslationService);
  private readonly messages = inject(MessagesService);
  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  readonly albumId = input.required<number>();
  readonly closed = output<void>();
  readonly created = output<void>();
  readonly formError = signal<string | null>(null);
  readonly t: Translator = this.translations.translate.bind(this.translations);
  private readonly trackModel = signal<NewTrackModel>({
    name: '',
    genreId: '',
    mediaTypeId: '',
    composer: '',
    duration: '',
    unitPrice: 0.99,
  });

  readonly options = resource<TrackOptions, boolean>({
    params: () => true,
    loader: async ({ abortSignal }) => {
      const [genresResponse, mediaTypesResponse] = await Promise.all([
        fetch('/api/genres', { signal: abortSignal }),
        fetch('/api/media-types', { signal: abortSignal }),
      ]);

      if (!genresResponse.ok) {
        throw new Error('GENRES_FETCH_ERROR');
      }
      if (!mediaTypesResponse.ok) {
        throw new Error('MEDIA_TYPES_FETCH_ERROR');
      }

      return {
        genres: await genresResponse.json() as GenreOption[],
        mediaTypes: await mediaTypesResponse.json() as MediaTypeOption[],
      };
    },
  });

  readonly trackForm = form(
    this.trackModel,
    (path) => {
      required(path.name, { message: 'TRACK_NAME_REQUIRED' });
      validate(path.name, ({ value }) => {
        const name = value();
        if (name.length > 0 && name.trim().length === 0) {
          return { kind: 'required', message: 'TRACK_NAME_REQUIRED' };
        }
        return name.length > 200 ? { kind: 'length', message: 'TRACK_NAME_TOO_LONG' } : undefined;
      });
      required(path.genreId, { message: 'GENRE_REQUIRED' });
      required(path.mediaTypeId, { message: 'MEDIA_TYPE_REQUIRED' });
      required(path.duration, { message: 'DURATION_REQUIRED' });
      validate(path.duration, ({ value }) => {
        const duration = value();
        if (duration.length === 0) {
          return undefined;
        }

        const match = /^(\d+):([0-5]\d)$/.exec(duration);
        if (match === null) {
          return { kind: 'format', message: 'DURATION_FORMAT' };
        }

        const milliseconds = (Number(match[1]) * 60 + Number(match[2])) * 1000;
        return Number.isSafeInteger(milliseconds) && milliseconds > 0 && milliseconds <= 2147483647
          ? undefined
          : { kind: 'range', message: 'DURATION_RANGE' };
      });
      validate(path.composer, ({ value }) =>
        value().length > 220 ? { kind: 'length', message: 'COMPOSER_TOO_LONG' } : undefined,
      );
      validate(path.unitPrice, ({ value }) => {
        const price = value();
        return Number.isFinite(price) && price >= 0 && Math.abs(price * 100 - Math.round(price * 100)) < 1e-8
          ? undefined
          : { kind: 'price', message: 'UNIT_PRICE_INVALID' };
      });
    },
    { submission: { action: () => this.createTrack() } },
  );

  constructor() {
    effect(() => {
      const error = this.options.error();
      if (error) {
        untracked(() => this.messages.error(
          this.translations.translateError(this.errorMessage(error), 'TRACK_OPTIONS_FETCH_FAILED'),
        ));
      }
    });
    effect(() => {
      const message = this.formError();
      if (message) {
        untracked(() => this.messages.error(
          this.translations.translateError(message, 'TRACK_CREATE_FAILED'),
        ));
      }
    });
  }

  private async createTrack(): Promise<TreeValidationResult> {
    const { name, genreId, mediaTypeId, composer, duration, unitPrice } = this.trackForm().value();
    const [minutes, seconds] = duration.split(':').map(Number);
    const milliseconds = (minutes * 60 + seconds) * 1000;
    this.formError.set(null);

    try {
      await this.tracksService.createTrack({
        name: name.trim(),
        albumId: this.albumId(),
        genreId: Number(genreId),
        mediaTypeId: Number(mediaTypeId),
        composer: composer.trim() || null,
        milliseconds,
        unitPrice,
      });
      this.created.emit();
      return undefined;
    } catch (error) {
      if (!(error instanceof TrackCreateError)) {
        if (!(error instanceof Error)) {
          throw error;
        }
        this.formError.set('TRACK_CREATE_FAILED');
        return undefined;
      }

      const fields: Record<string, FieldTree<string>> = {
        name: this.trackForm.name,
        genreId: this.trackForm.genreId,
        mediaTypeId: this.trackForm.mediaTypeId,
        milliseconds: this.trackForm.duration,
        composer: this.trackForm.composer,
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

  errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
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
