import { AfterViewInit, Component, OnInit, computed } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Amplify } from 'aws-amplify';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';
import { CommonModule } from '@angular/common';
import { AuthCognitoService } from '../../services/auth.cognito.service';
import { Hub } from '@aws-amplify/core';
import { environment } from '../../../environments/environment';

// UserPoolId ex: us-west-2_YVqg8KMpd
// aws cognito-idp list-user-pools --max-results 2
// UserPoolClientId ex: 3i10rtp3abg45dt4rs8o2nsh
// aws cognito-idp list-user-pools --max-results 2 | jq -r '.UserPools[].Id' | xargs -I {} aws cognito-idp list-user-pool-clients --user-pool-id {} --max-results 2 | jq -r '.UserPoolClients[].ClientId'

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: environment.USER_POOL_ID,
      userPoolClientId: environment.USER_POOL_CLIENT_ID,
    }
  }
});

@Component({
  selector: 'app-login-cognito',
  standalone: true,
  imports: [ReactiveFormsModule, AmplifyAuthenticatorModule, CommonModule],
  templateUrl: './login-cognito.component.html',
  styleUrl: './login-cognito.component.scss'
})
export class LoginCognitoPageComponent implements OnInit, AfterViewInit {
  loggedIn:boolean = false;
  user:any = null;

  formFields = {
    signUp: {
      name: {
        order: 10
      },
      email: {
        order: 2
      },
      password: {
        order: 5
      },
      confirm_password: {
        order: 6
      }
    },
  };

  constructor(public authCognitoService:AuthCognitoService, private router:Router) {
    Hub.listen('auth', (data) => {
      const { payload } = data;
      console.log(`[LoginCognitoPageComponent] payload: ${JSON.stringify(payload, null, 2)}`);
      switch (payload.event) {
        case 'signedIn':
          this.onUserSignIn();
          break;
        case 'signedOut':
          this.onUserSignOut();
          break;
        default:
          break;
      }
    });
  }
  
  ngAfterViewInit(): void {
    if (this.authCognitoService.loggedIn() === true) {
      this.router.navigate(['/']);
    }
  }

  onUserSignOut() {
    console.log('User has signed out');
    this.authCognitoService.refreshSignals();
    this.router.navigate(['/']);
  }

  onUserSignIn() {
    console.log('User has signed in');
    this.authCognitoService.refreshSignals();
    this.router.navigate(['/']);
  }
  
  ngOnInit(): void {
  }

}
