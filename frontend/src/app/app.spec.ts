import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { App } from './app';
import { LoginService } from './login/login.service';

describe('App', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ email: null }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    await TestBed.configureTestingModule({
      imports: [App],
    })
      .compileComponents();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create the app', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Chinook DB Demo');
  });

  it('hides the login button when a session already exists', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ email: 'jane@example.com' }),
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('nav .new')).toBeNull();
  });

  it('stores the complete user returned by the session endpoint', async () => {
    const currentUser = {
      employeeId: 7,
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
    };
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => currentUser,
    });

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(TestBed.inject(LoginService).currentUser()).toEqual(currentUser);
  });

  it('clears the shared session after the server confirms logout', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ email: 'jane@example.com' }),
    });
    await TestBed.inject(LoginService).login('jane@example.com');
    fixture.detectChanges();
    expect(fixture.componentInstance.hasSession()).toBe(true);

    await fixture.componentInstance.logout();
    fixture.detectChanges();

    expect(fetchMock).toHaveBeenLastCalledWith('/api/login/session', { method: 'DELETE' });
    expect(fixture.componentInstance.hasSession()).toBe(false);
    expect(fixture.nativeElement.querySelector('.login a')?.textContent).toContain('Login');
  });
});
