import { Component, effect, inject, input, model, output, resource, untracked } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { KeyProvider, type KeyRecord } from '../keyprovider';
import { TranslationService } from '../i18n/translation.service';
import { MessagesService } from '../messages';

@Component({
  imports: [],
  selector: 'app-selector',
  styleUrl: './selector.css',
  templateUrl: './selector.html',
})
export class Selector implements FormValueControl<string> {
  private readonly messages = inject(MessagesService);
  private readonly translations = inject(TranslationService);
  readonly keyProvider = input<KeyProvider>();
  readonly inputId = input<string>();
  readonly keyList = resource<KeyRecord[], KeyProvider | undefined>({
    params: () => this.keyProvider(),
    loader: async ({ params }) => params?.getKeyList() ?? [],
  });
  readonly uniqueId = crypto.randomUUID();
  readonly key = model<number | undefined>(undefined);
  readonly value = model('');
  readonly touched = input(false);
  readonly invalid = input(false);
  readonly required = input(false);
  readonly touch = output<void>();

  constructor() {
    effect(() => {
      const value = this.value();
      const keyList = this.keyList.value();
      this.key.set(keyList?.find(o => o.value === value.trim())?.key);
    });
    effect(() => {
      const error = this.keyList.error();
      if (error) {
        untracked(() => this.messages.error(this.translations.translate('KEY_FETCH_ERROR')));
      }
    });
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.key.set(this.keyList.value()?.find(o => o.value === value.trim())?.key);
  }

  onBlur(): void {
    this.touch.emit();
  }

}
