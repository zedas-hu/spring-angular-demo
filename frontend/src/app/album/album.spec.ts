import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { routes } from '../app.routes';
import { TranslationService } from '../i18n/translation.service';
import { Album } from './album';

describe('Album', () => {
  let component: Album;
  let fixture: ComponentFixture<Album>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Album],
      providers: [provideRouter(routes)],
    }).compileComponents();

    fixture = TestBed.createComponent(Album);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('translates the invalid album ID message when the language changes', () => {
    const translations = TestBed.inject(TranslationService);

    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Invalid album ID.');

    translations.setLanguage('hu');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Érvénytelen albumazonosító.');
  });
});
