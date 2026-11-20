import { Injectable } from '@angular/core';
import { Language } from './i18n/translation.service';

export type Theme = 'light' | 'dark';

const LANGUAGE_STORAGE_KEY = 'language';
const THEME_STORAGE_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class AppPreferencesService {
  getLanguage(): Language {
    const language = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return language === 'hu' ? 'hu' : 'en';
  }

  setLanguage(language: Language): void {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }

  getTheme(): Theme {
    const theme = localStorage.getItem(THEME_STORAGE_KEY);
    return theme === 'light' ? 'light' : 'dark';
  }

  setTheme(theme: Theme): void {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
}
