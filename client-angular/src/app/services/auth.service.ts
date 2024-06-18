import { Injectable, signal } from '@angular/core';
import jwtDecode from 'jwt-decode';

const API_URL = 'http://localhost:9000';
const ACCESS_TOKEN_KEY = 'accessToken';
const EMPTY_USER = { id: '', email: '', companyId: '' };

export interface User {
  id: string;
  email: string;
  companyId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedInSignal = signal<boolean>(false);
  readonly loggedIn = this.loggedInSignal.asReadonly();

  private userSignal = signal<User>(EMPTY_USER);
  readonly user = this.userSignal.asReadonly();

  private tokenSignal = signal<string>(localStorage.getItem(ACCESS_TOKEN_KEY) || '');
  readonly token = this.tokenSignal.asReadonly();

  constructor() { }

  private changeToken(token: string) {
    this.tokenSignal.update(() => token);
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  private setLoggedIn(loggedIn: boolean) {
    this.loggedInSignal.update(() => loggedIn);
  }

  public getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  public async loginWithGoogle(credentials: any) {
    const response = await fetch(`${API_URL}/login/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jwtDecode(credentials)),
    });
    if (!response.ok) {
      return null;
    }
    const { token } = await response.json();
    return this.getUserFromToken(token);

  }
  
  public async login(email:string, password:string) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      return null;
    }
    const { token } = await response.json();
    return this.getUserFromToken(token);
  }
  
  public getUser() {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }
    return this.getUserFromToken(token);
  }
  
  public logout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    this.setLoggedIn(false);
    this.userSignal.update(() => {
      return EMPTY_USER;
    });
    this.tokenSignal.update(() => '');
  }
  
  getUserFromToken(token:string) {
    const claims:any = jwtDecode(token);

    if (claims) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
      this.changeToken(token);
      this.setLoggedIn(true);
      this.userSignal.update(() => {
        return {
          id: claims.sub,
          email: claims.email,
          companyId: claims.companyId,
        };
      });
      return true;
    } 
    else { 
      return false;
    }
  }
}
