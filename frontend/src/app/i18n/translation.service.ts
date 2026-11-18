import { Injectable, signal } from '@angular/core';
import EN_MESSAGES from './en.json';
import HU_MESSAGES from './hu.json';

export type Language = 'en' | 'hu';
export type Translator = (code: string, ...params: (string | number)[]) => string;

const MESSAGES: Record<Language, Record<string, string>> = {
  en: EN_MESSAGES,
  hu: HU_MESSAGES,
};

@Injectable({ providedIn: 'root' })
export class TranslationService {
  readonly language = signal<Language>('en');

  setLanguage(language: Language): void {
    this.language.set(language);
  }

  translate(code: string, ...params: (string | number)[]): string {
    const message = MESSAGES[this.language()]?.[code] ?? code;
    if (params.length === 0) 
      return message;
    return message.replace(/\$(\d+)/g, ($0, $1) => String(params[Number($1) - 1] ?? $0));
  }
}
