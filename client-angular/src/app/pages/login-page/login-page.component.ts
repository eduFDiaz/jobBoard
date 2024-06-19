import { AfterViewInit, Component, OnInit, computed } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

declare var google:any;

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent implements OnInit, AfterViewInit {
  loggedIn:boolean = false;
  email:string = '';
  password:string = '';
  error:boolean = false;
  user:any = null;
  
  loginForm: FormGroup = new FormGroup({
    'email': new FormControl('', Validators.required),
    'password': new FormControl('', Validators.required)
  });

  constructor(public authService: AuthService, private router:Router) {}
  
  ngAfterViewInit(): void {
    google.accounts.id.initialize({
      client_id: '784635447627-knsfjq2ujda7s8keqim3hlch527d1bqp.apps.googleusercontent.com',
      callback: (resp:any) => this.handleGoogleLogin(resp),
    });
    
    const signinButton = document.getElementById('google-signin');
      google.accounts.id.renderButton(signinButton, {
        theme: 'filled_blue',
        size: 'large',
    });
  }
  
  ngOnInit(): void {
    this.loginForm = new FormGroup({
      'email': new FormControl('', [Validators.email, Validators.required]),
      'password': new FormControl('', [Validators.required])
    });

    if (this.authService.loggedIn() === true) {
      this.router.navigate(['/']);
    }
  }

  onSubmit = async (event:any) => {
    event.preventDefault();
    this.error = false;
    const loggedInSuccess = await this.authService.login(this.loginForm.value.email, this.loginForm.value.password);
    if (loggedInSuccess) {
      console.log('Login successful', loggedInSuccess);
      this.router.navigate(['/']);
    }
  };

  handleGoogleLogin = async (resp:any) => {
    console.log('Google login response', resp);
    const loggedInSuccess = await this.authService.loginWithGoogle(resp.credential);
    if (loggedInSuccess) {
      console.log('Login successful', loggedInSuccess);
      this.router.navigate(['/']);
    }
  }

}
