import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { LoginComponent } from './login';
import { LoginService } from './login.service';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    fetchMock = vi.fn(async (url: string, options?: RequestInit) => {
      if (url === '/api/employees') {
        return {
          ok: true,
          json: async () => [{
            employeeId: 7,
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@example.com',
          }],
        };
      }

      if (url === '/api/login' && options?.method === 'POST') {
        return {
          ok: true,
          json: async () => ({ email: 'jane@example.com' }),
        };
      }

      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
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
    expect(fetchMock).toHaveBeenLastCalledWith('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'jane@example.com' }),
    });
    expect(closed).toBe(true);
  });
});
