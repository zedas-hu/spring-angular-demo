import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App theme', () => {
  beforeEach(async () => {
    localStorage.removeItem('theme');
    document.documentElement.style.colorScheme = '';
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('applies the stored theme when the app is created', () => {
    localStorage.setItem('theme', 'light');

    TestBed.createComponent(App);

    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('applies and stores the selected theme', () => {
    const app = TestBed.createComponent(App).componentInstance;

    app.setTheme('dark');

    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});
