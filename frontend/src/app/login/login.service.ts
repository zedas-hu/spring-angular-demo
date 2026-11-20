import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api.service';

export interface EmployeeLoginOption {
  employeeId: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface LoginSessionResponse {
  email: string | null;
}

export interface CurrentUser {
  employeeId: number | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly api = inject(ApiService);
  private readonly currentUserState = signal<CurrentUser | null>(null);
  private readonly sessionChecked = signal(false);

  readonly currentUser = this.currentUserState.asReadonly();
  readonly hasSession = computed(() => Boolean(this.currentUser()?.email));
  readonly isSessionChecked = this.sessionChecked.asReadonly();

  getEmployees(signal: AbortSignal): Promise<EmployeeLoginOption[]> {
    return this.api.request<EmployeeLoginOption[]>('GET', '/api/employees', {
      signal,
      fallbackError: 'LOGIN_EMPLOYEES_FETCH_FAILED',
    });
  }

  getSession(): Promise<CurrentUser> {
    return this.api.request<CurrentUser>('GET', '/api/login/session', {
      fallbackError: 'LOGIN_SESSION_FETCH_FAILED',
    });
  }

  async loadSession(): Promise<void> {
    try {
      this.currentUserState.set(await this.getSession());
    } finally {
      this.sessionChecked.set(true);
    }
  }

  async login(email: string): Promise<string> {
    const session = await this.api.request<LoginSessionResponse>('POST', '/api/login', {
      body: { email },
      fallbackError: 'LOGIN_FAILED',
    });
    if (!session.email) {
      throw new Error('LOGIN_FAILED');
    }

    this.currentUserState.set({
      employeeId: null,
      firstName: null,
      lastName: null,
      email: session.email,
    });
    this.sessionChecked.set(true);
    return session.email;
  }

  async logout(): Promise<void> {
    await this.api.request<void>('DELETE', '/api/login/session', {
      fallbackError: 'LOGOUT_FAILED',
    });

    this.currentUserState.set(null);
  }
}

