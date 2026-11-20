import { Component, effect, ElementRef, inject, output, resource, signal, untracked, viewChild } from '@angular/core';
import { TranslationService, Translator } from '../i18n/translation.service';
import { MessagesService } from '../messages';
import { EmployeeLoginOption, LoginService } from './login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
})
export class LoginComponent {
  private readonly loginService = inject(LoginService);
  private readonly translations = inject(TranslationService);
  private readonly messages = inject(MessagesService);
  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  readonly t: Translator = this.translations.translate.bind(this.translations);
  readonly selectedEmail = signal('');
  readonly submitting = signal(false);
  readonly closed = output<void>();
  readonly employees = resource<EmployeeLoginOption[], boolean>({
    params: () => true,
    loader: ({ abortSignal }) => this.loginService.getEmployees(abortSignal),
  });

  constructor() {
    effect(() => {
      const error = this.employees.error();
      if (error) {
        untracked(() => this.messages.error(this.translations.translateError(
          error instanceof Error ? error.message : 'LOGIN_EMPLOYEES_FETCH_FAILED',
          'LOGIN_EMPLOYEES_FETCH_FAILED',
        )));
      }
    });
  }

  selectEmployee(event: Event): void {
    this.selectedEmail.set((event.target as HTMLSelectElement).value);
  }

  async login(event: Event): Promise<void> {
    event.preventDefault();
    const email = this.selectedEmail();
    if (!email || this.submitting()) {
      return;
    }

    this.submitting.set(true);
    try {
      await this.loginService.login(email);
      this.close();
    } catch (error) {
      this.messages.error(this.translations.translateError(
        error instanceof Error ? error.message : 'LOGIN_FAILED',
        'LOGIN_FAILED',
      ));
    } finally {
      this.submitting.set(false);
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
