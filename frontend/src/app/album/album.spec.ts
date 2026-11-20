import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { routes } from '../app.routes';
import { TranslationService } from '../i18n/translation.service';
import { LoginService } from '../login/login.service';
import { MessagesService } from '../messages';
import { Album } from './album';

describe('Album', () => {
  let component: Album;
  let fixture: ComponentFixture<Album>;
  let messageError: ReturnType<typeof vi.fn>;
  let hasSession: WritableSignal<boolean>;

  beforeEach(async () => {
    messageError = vi.fn();
    hasSession = signal(false);
    await TestBed.configureTestingModule({
      imports: [Album],
      providers: [
        provideRouter(routes),
        { provide: MessagesService, useValue: { error: messageError } },
        { provide: LoginService, useValue: { hasSession } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Album);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows an invalid album ID through the messages service', () => {
    const translations = TestBed.inject(TranslationService);

    fixture.detectChanges();
    expect(messageError).toHaveBeenCalledWith('Invalid album ID.');

    translations.setLanguage('hu');
    fixture.detectChanges();
    expect(messageError).toHaveBeenCalledOnce();
  });

  it('sets sessionLoaded only when the server reports an active session', async () => {
    expect(component.sessionLoaded()).toBe(false);

    hasSession.set(true);
    fixture.detectChanges();

    expect(component.sessionLoaded()).toBe(true);
  });
});
