import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { routes } from '../app.routes';
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
});
