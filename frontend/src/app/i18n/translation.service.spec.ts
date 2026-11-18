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
});
