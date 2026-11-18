import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Language, TranslationService, Translator } from './i18n/translation.service';
import { Popup } from './popup/popup';

type Theme = 'light' | 'dark';

const LANGUAGE_STORAGE_KEY = 'language';
const THEME_STORAGE_KEY = 'theme';

@Component({
  imports: [RouterOutlet, Popup],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html'
})
export class App {
  private readonly translations = inject(TranslationService);
  protected readonly title = signal('frontend');
  readonly t: Translator = this.translations.translate.bind(this.translations);

  constructor() {
    let lang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
    if (lang !== 'en' && lang !== 'hu')
      lang = 'en';

    this.translations.setLanguage(lang);

    let theme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
    if (theme !== 'light' && theme !== 'dark')
      theme = 'dark';
    document.documentElement.style.colorScheme = theme;
  }

  setLanguage(lang: Language) {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    this.translations.setLanguage(lang);
  }

  setTheme(theme: Theme): void {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.documentElement.style.colorScheme = theme;
  }
}
