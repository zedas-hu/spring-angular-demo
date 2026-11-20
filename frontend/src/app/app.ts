import { Component, ComponentRef, inject, signal, ViewContainerRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Language, TranslationService, Translator } from './i18n/translation.service';
import { Popup } from './popup/popup';
import { LoginComponent } from './login/login';
import { LoginService } from './login/login.service';
import { MessagesService } from './messages';
import { AppPreferencesService, Theme } from './app-preferences.service';

@Component({
  imports: [RouterOutlet, Popup],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html'
})
export class App {
  private readonly translations = inject(TranslationService);
  private readonly preferences = inject(AppPreferencesService);
  private readonly loginService = inject(LoginService);
  private readonly messages = inject(MessagesService);
  private readonly viewContainer = inject(ViewContainerRef);
  private loginDialogRef?: ComponentRef<LoginComponent>;
  protected readonly title = signal('frontend');
  readonly t: Translator = this.translations.translate.bind(this.translations);
  readonly sessionInitialized = this.loginService.isSessionChecked; // Prevent flash
  readonly hasSession = this.loginService.hasSession;

  constructor() {
    this.translations.setLanguage(this.preferences.getLanguage());
    document.documentElement.style.colorScheme = this.preferences.getTheme();

    this.loadSession();
  }

  setLanguage(lang: Language) {
    this.preferences.setLanguage(lang);
    this.translations.setLanguage(lang);
  }

  setTheme(theme: Theme): void {
    this.preferences.setTheme(theme);
    document.documentElement.style.colorScheme = theme;
  }

  loginDialog(): void {
    if (!this.loginDialogRef) {
      const dialog = this.viewContainer.createComponent(LoginComponent);
      dialog.changeDetectorRef.detectChanges();
      dialog.instance.closed.subscribe(() => this.destroyLoginDialog());
      this.loginDialogRef = dialog;
    }

    this.loginDialogRef.instance.open();
  }

  async logout(): Promise<void> {
    try {
      await this.loginService.logout();
    } catch (error) {
      this.messages.error(this.translations.translateError(
        error instanceof Error ? error.message : 'LOGOUT_FAILED',
        'LOGOUT_FAILED',
      ));
    }
  }

  private async loadSession(): Promise<void> {
    try {
      await this.loginService.loadSession();
    } catch (error) {
      this.messages.error(this.translations.translateError(
        error instanceof Error ? error.message : 'LOGIN_SESSION_FETCH_FAILED',
        'LOGIN_SESSION_FETCH_FAILED',
      ));
    }
  }

  private destroyLoginDialog(): void {
    this.loginDialogRef?.destroy();
    this.loginDialogRef = undefined;
  }
}
