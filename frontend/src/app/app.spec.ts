import { TestBed } from '@angular/core/testing';
import { Mock, vi } from 'vitest';
import { App } from './app';
import { LoginService } from './login/login.service';
import { ApiStubHandler, provideApiStub } from './testing/api-stub';

describe('App', () => {
  let apiMock: Mock<ApiStubHandler>;

  beforeEach(async () => {
    apiMock = vi.fn<ApiStubHandler>(() => ({ body: { email: null } }));

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideApiStub(apiMock)],
    })
      .compileComponents();
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
    apiMock.mockReturnValue({ body: { email: 'jane@example.com' } });
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
    apiMock.mockReturnValue({ body: currentUser });

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(TestBed.inject(LoginService).currentUser()).toEqual(currentUser);
  });

  it('clears the shared session after the server confirms logout', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    apiMock.mockReturnValueOnce({ body: { email: 'jane@example.com' } });
    await TestBed.inject(LoginService).login('jane@example.com');
    fixture.detectChanges();
    expect(fixture.componentInstance.hasSession()).toBe(true);

    await fixture.componentInstance.logout();
    fixture.detectChanges();

    expect(apiMock).toHaveBeenLastCalledWith(expect.objectContaining({ method: 'DELETE', url: '/api/login/session' }));
    expect(fixture.componentInstance.hasSession()).toBe(false);
    expect(fixture.nativeElement.querySelector('.login a')?.textContent).toContain('Login');
  });
});
