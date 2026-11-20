import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpRequest } from '@angular/common/http';
import { Mock, vi } from 'vitest';
import { ApiStubHandler, provideApiStub } from '../testing/api-stub';
import { LoginComponent } from './login';
import { LoginService } from './login.service';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let apiMock: Mock<ApiStubHandler>;

  beforeEach(async () => {
    apiMock = vi.fn<ApiStubHandler>(async ({ url, method }: HttpRequest<unknown>) => {
      if (url === '/api/employees') {
        return {
          body: [{
            employeeId: 7,
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@example.com',
          }],
        };
      }

      if (url === '/api/login' && method === 'POST') {
        return { body: { email: 'jane@example.com' } };
      }

      throw new Error(`Unexpected request: ${url}`);
    });

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideApiStub(apiMock)],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('shows a demo-login warning above the employee selector', () => {
    const warning = fixture.nativeElement.querySelector('.field-warning') as HTMLParagraphElement;
    const employeeSelect = fixture.nativeElement.querySelector('#login-employee') as HTMLSelectElement;

    expect(warning.textContent).toContain('simulated login');
    expect(warning.compareDocumentPosition(employeeSelect) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('lists employees and creates a session for the selected email', async () => {
    const employeeOption = fixture.nativeElement.querySelector('#login-employee option[value="jane@example.com"]');
    expect(employeeOption?.textContent).toContain('Jane Doe');

    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    dialog.showModal = function () { this.open = true; };
    dialog.close = function () {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    };
    component.open();

    const select = fixture.nativeElement.querySelector('#login-employee') as HTMLSelectElement;
    select.value = 'jane@example.com';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    let closed = false;
    component.closed.subscribe(() => closed = true);
    await component.login(new Event('submit', { cancelable: true }));

    expect(TestBed.inject(LoginService).hasSession()).toBe(true);
    expect(apiMock).toHaveBeenLastCalledWith(expect.objectContaining({
      method: 'POST',
      url: '/api/login',
      body: { email: 'jane@example.com' },
    }));
    expect(closed).toBe(true);
  });
});
