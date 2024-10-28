import { Injectable, signal } from '@angular/core';
import { signOut, fetchAuthSession } from 'aws-amplify/auth';
import { environment } from '../../environments/environment';

const API_URL = environment.API_URL;

export interface Company {
  companyId: string;
  name: string;
  description: string;
}

export interface User {
  username: string;
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  companyId: string;
  company: Company;
}

export const EMPTY_USER: User = {
  username: '',
  userId: '',
  email: '',
  fullName: '',
  phone: '',
  companyId: '',
  company: {
    companyId: '',
    name: '',
    description: ''
  }
};

@Injectable({
  providedIn: 'root'
})
export class AuthCognitoService {

  private loggedInSignal = signal<boolean>(false);
  readonly loggedIn = this.loggedInSignal.asReadonly();

  private userSignal = signal<User>(EMPTY_USER);
  readonly user = this.userSignal.asReadonly();

  private accessTokenSignal = signal<string>('');
  readonly accessToken = this.accessTokenSignal.asReadonly();

  constructor() {
    this.refreshSignals();
  }

  async getTokens() {
    const session = await fetchAuthSession();   // Fetch the authentication session
    if (session.tokens && session.tokens.idToken) {
      console.log('Access Token:', session.tokens.accessToken.toString());
      console.log('ID Token:', session.tokens.idToken.toString());
      return session.tokens;
    } else {
      console.warn('Tokens are undefined');
      return undefined;
    }
  }

  refreshSignals() {
    this.getTokens().then(async (tokens) => {
      if (!tokens) {
        this.loggedInSignal.update(() => false);
        this.userSignal.update(() => EMPTY_USER);
        this.accessTokenSignal.update(() => '');
        return;
      }
      const dbUserResponse = await fetch(`${API_URL}/user/${tokens?.idToken?.payload['sub']?.toString()}`);
      const dbUser = await dbUserResponse.json();
      let currentUser:User = {
        email: tokens?.idToken?.payload['email']?.toString() || '',
        userId: tokens?.idToken?.payload['sub']?.toString() || '',
        username: tokens?.idToken?.payload['cognito:username']?.toString() || '',
        fullName: tokens?.idToken?.payload['name']?.toString() || '',
        phone: tokens?.idToken?.payload['phone_number']?.toString() || '',
        companyId: dbUser.companyId,
        company: dbUser.company
      };
      console.log(`[AuthCognitoService] refreshSignals() ${JSON.stringify(currentUser, null, 2)}`);
      this.userSignal.update(() => currentUser);
      this.loggedInSignal.update(() => true);

      console.log(`[AuthCognitoService] refreshSignals() ${JSON.stringify(tokens, null, 2)}`);
      this.accessTokenSignal.update(() => tokens?.accessToken.toString() || '');
    }).catch(() => {});
  }

  signOut() {
    signOut();
    this.loggedInSignal.set(false);
    this.userSignal.set(EMPTY_USER);
    this.accessTokenSignal.set('');
  }

}