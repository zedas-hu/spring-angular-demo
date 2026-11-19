import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('defaults to English', () => {
    const service = TestBed.inject(TranslationService);

    expect(service.language()).toBe('en');
  });

  it('updates the active language', () => {
    const service = TestBed.inject(TranslationService);

    service.setLanguage('hu');

    expect(service.language()).toBe('hu');
    expect(service.translate('LANGUAGE')).toBe('Nyelv');
  });

  it('translates known error codes and uses a localized fallback for unknown ones', () => {
    const service = TestBed.inject(TranslationService);
    service.setLanguage('hu');

    expect(service.translateError('TRACKS_FETCH_ERROR', 'LOAD_TRACKS_FAILED'))
      .toBe('A zeneszámok betöltése nem sikerült.');
    expect(service.translateError('UNRECOGNIZED_ERROR', 'TRACK_CREATE_FAILED'))
      .toBe('A zeneszám létrehozása nem sikerült. Próbáld újra.');
  });
});
