import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { routes } from '../app.routes';
import { TranslationService } from '../i18n/translation.service';
import { MessagesService } from '../messages';
import { Album } from './album';

describe('Album', () => {
  let component: Album;
  let fixture: ComponentFixture<Album>;
  let messageError: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    messageError = vi.fn();
    await TestBed.configureTestingModule({
      imports: [Album],
      providers: [
        provideRouter(routes),
        { provide: MessagesService, useValue: { error: messageError } },
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
});
