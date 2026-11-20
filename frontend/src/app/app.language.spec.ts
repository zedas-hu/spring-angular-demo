import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { TranslationService } from './i18n/translation.service';

describe('App language', () => {
  beforeEach(async () => {
    localStorage.removeItem('language');
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('loads the stored language when the app is created', () => {
    localStorage.setItem('language', 'hu');

    TestBed.createComponent(App);

    expect(TestBed.inject(TranslationService).language()).toBe('hu');
  });

  it('stores the selected language', () => {
    const app = TestBed.createComponent(App).componentInstance;

    app.setLanguage('hu');

    expect(localStorage.getItem('language')).toBe('hu');
    expect(TestBed.inject(TranslationService).language()).toBe('hu');
  });
});
