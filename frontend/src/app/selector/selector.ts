import { Component, effect, input, model, resource } from '@angular/core';
import { KeyProvider, type KeyRecord } from '../keyprovider';

@Component({
  imports: [],
  selector: 'app-selector',
  styleUrl: './selector.css',
  templateUrl: './selector.html',
})
export class Selector {
  readonly keyProvider = input<KeyProvider>();
  readonly inputId = input<string>();
  readonly ariaInvalid = input(false);
  readonly keyList = resource<KeyRecord[], KeyProvider | undefined>({
    params: () => this.keyProvider(),
    loader: async ({ params }) => params?.getKeyList() ?? [],
  });
  readonly uniqueId = crypto.randomUUID();
  readonly key = model<number | undefined>(undefined);
  readonly value = model('');

  constructor() {
    effect(() => {
      const value = this.value();
      const keyList = this.keyList.value();
      this.key.set(keyList?.find(o => o.value === value)?.key);
    });
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.key.set(this.keyList.value()?.find(o => o.value === value)?.key);
  }

  errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
