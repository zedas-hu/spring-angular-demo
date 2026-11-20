import { computed, Injectable, signal } from '@angular/core';

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
  private readonly currentUserState = signal<CurrentUser | null>(null);
  private readonly sessionChecked = signal(false);

  readonly currentUser = this.currentUserState.asReadonly();
  readonly hasSession = computed(() => Boolean(this.currentUser()?.email));
  readonly isSessionChecked = this.sessionChecked.asReadonly();

  async getEmployees(signal: AbortSignal): Promise<EmployeeLoginOption[]> {
    const response = await fetch('/api/employees', { signal });
    if (!response.ok) {
      throw new Error('LOGIN_EMPLOYEES_FETCH_FAILED');
    }

    return response.json() as Promise<EmployeeLoginOption[]>;
  }

  async getSession(): Promise<CurrentUser> {
    const response = await fetch('/api/login/session');
    if (!response.ok) {
      throw new Error('LOGIN_SESSION_FETCH_FAILED');
    }

    return await response.json() as CurrentUser;
  }

  async loadSession(): Promise<void> {
    try {
      this.currentUserState.set(await this.getSession());
    } finally {
      this.sessionChecked.set(true);
    }
  }

  async login(email: string): Promise<string> {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      throw new Error('LOGIN_FAILED');
    }

    const session = await response.json() as LoginSessionResponse;
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
    const response = await fetch('/api/login/session', { method: 'DELETE' });
    if (!response.ok) {
      throw new Error('LOGOUT_FAILED');
    }

    this.currentUserState.set(null);
  }
}
