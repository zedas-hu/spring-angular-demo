import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { routes } from '../app.routes';
import { AlbumSelection } from './new-album';

describe('AlbumSelection', () => {
  let fixture: ComponentFixture<AlbumSelection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlbumSelection],
      providers: [provideRouter(routes)],
    }).compileComponents();

    fixture = TestBed.createComponent(AlbumSelection);
  });

  it('links back to tracks', () => {
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/tracks');
  });
});
