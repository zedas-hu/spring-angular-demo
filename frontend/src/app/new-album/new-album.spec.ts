import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { routes } from '../app.routes';
import { NewAlbumComponent } from './new-album';

describe('NewAlbumComponent', () => {
  let fixture: ComponentFixture<NewAlbumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewAlbumComponent],
      providers: [provideRouter(routes)],
    }).compileComponents();

    fixture = TestBed.createComponent(NewAlbumComponent);
  });

  it('links back to tracks', () => {
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/tracks');
  });
});
